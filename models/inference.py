"""
Predictive Maintenance Inference Module
========================================
This module handles ML model loading and predictions.
Provided by the ML team, adapted for backend integration.

Usage:
    inference = PredictiveMaintenanceInference('models')
    result = inference.predict({
        'Type': 'L',
        'Air temperature': 300.0,
        'Process temperature': 309.5,
        'Rotational speed': 1350,
        'Torque': 45.0,
        'Tool wear': 210
    })
"""

import numpy as np
import pandas as pd
import joblib
import json
import os

# Try to import SHAP (optional - for explanations)
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    print("[WARNING] SHAP not installed. Feature explanations will be limited.")
    print("          Install with: pip install shap")


class PredictiveMaintenanceInference:
    """
    Inference class for the Predictive Maintenance Copilot.
    
    This class:
    1. Loads trained XGBoost models
    2. Applies feature engineering
    3. Makes predictions
    4. Provides explanations (if SHAP is available)
    """

    def __init__(self, model_dir='models'):
        """
        Initialize the inference engine.
        
        Args:
            model_dir: Directory containing the model files
        """
        self.model_dir = model_dir
        
        # Check if models exist
        if not os.path.exists(model_dir):
            raise FileNotFoundError(
                f"Model directory '{model_dir}' not found. "
                "Please copy the models from the ML team."
            )
        
        # Load models
        try:
            self.binary_model = joblib.load(f'{model_dir}/binary_failure_model.joblib')
            self.multiclass_model = joblib.load(f'{model_dir}/multiclass_failure_model.joblib')
            self.type_encoder = joblib.load(f'{model_dir}/type_encoder.joblib')
            print("[OK] ML models loaded successfully!")
        except FileNotFoundError as e:
            raise FileNotFoundError(
                f"Model files not found in '{model_dir}'. "
                f"Required files: binary_failure_model.joblib, multiclass_failure_model.joblib, type_encoder.joblib. "
                f"Error: {e}"
            )
        
        # Load metadata
        metadata_path = f'{model_dir}/model_metadata.json'
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
            self.feature_cols = self.metadata.get('feature_columns', [])
        else:
            # Default feature columns if metadata not found
            self.feature_cols = [
                'Air temperature', 'Process temperature',
                'Rotational speed', 'Torque', 'Tool wear',
                'Temp_Diff', 'Temp_Ratio', 'Power', 'Overstrain',
                'Temp_Risk', 'Speed_Risk', 'HDF_Risk',
                'Power_Low', 'Power_High', 'PWF_Risk',
                'Tool_Wear_Ratio', 'TWF_Risk',
                'OSF_Risk_Ratio', 'OSF_Risk',
                'Speed_Torque_Ratio', 'Torque_Wear_Interaction', 
                'Combined_Risk_Score', 'Type_encoded'
            ]
        
        # Class names for failure types
        # Index 0 = No Failure, Index 1-5 = Failure types
        self.class_names = ['No Failure', 'TWF', 'HDF', 'PWF', 'OSF', 'RNF']
        
        # Initialize SHAP explainer if available
        if SHAP_AVAILABLE:
            try:
                self.explainer = shap.TreeExplainer(self.binary_model)
            except Exception as e:
                print(f"[WARNING] Could not initialize SHAP explainer: {e}")
                self.explainer = None
        else:
            self.explainer = None

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply feature engineering to input data.
        
        This creates the physics-based features that the model expects:
        - Temperature difference and ratio
        - Power calculation
        - Risk indicators for each failure mode
        
        Args:
            df: DataFrame with raw sensor readings
            
        Returns:
            DataFrame with engineered features
        """
        df_eng = df.copy()
        
        # Temperature features
        df_eng['Temp_Diff'] = df_eng['Process temperature'] - df_eng['Air temperature']
        df_eng['Temp_Ratio'] = df_eng['Process temperature'] / df_eng['Air temperature']
        
        # Power calculation (Torque x Angular velocity in radians)
        df_eng['Power'] = df_eng['Torque'] * df_eng['Rotational speed'] * 2 * np.pi / 60
        
        # Overstrain factor
        df_eng['Overstrain'] = df_eng['Tool wear'] * df_eng['Torque']
        
        # HDF (Heat Dissipation Failure) risk indicators
        df_eng['Temp_Risk'] = (df_eng['Temp_Diff'] < 8.6).astype(int)
        df_eng['Speed_Risk'] = (df_eng['Rotational speed'] < 1380).astype(int)
        df_eng['HDF_Risk'] = df_eng['Temp_Risk'] * df_eng['Speed_Risk']
        
        # PWF (Power Failure) risk indicators
        df_eng['Power_Low'] = (df_eng['Power'] < 3500).astype(int)
        df_eng['Power_High'] = (df_eng['Power'] > 9000).astype(int)
        df_eng['PWF_Risk'] = ((df_eng['Power'] < 3500) | (df_eng['Power'] > 9000)).astype(int)
        
        # TWF (Tool Wear Failure) risk indicators
        df_eng['Tool_Wear_Ratio'] = df_eng['Tool wear'] / 240
        df_eng['TWF_Risk'] = (
            (df_eng['Tool wear'] >= 200) & (df_eng['Tool wear'] <= 240)
        ).astype(int)

        # OSF (Overstrain Failure) risk calculation
        def calc_osf_risk(row):
            thresholds = {'L': 11000, 'M': 12000, 'H': 13000}
            return row['Overstrain'] / thresholds.get(row['Type'], 12000)

        df_eng['OSF_Risk_Ratio'] = df_eng.apply(calc_osf_risk, axis=1)
        df_eng['OSF_Risk'] = (df_eng['OSF_Risk_Ratio'] > 1).astype(int)
        
        # Interaction features
        df_eng['Speed_Torque_Ratio'] = df_eng['Rotational speed'] / (df_eng['Torque'] + 1)
        df_eng['Torque_Wear_Interaction'] = df_eng['Torque'] * df_eng['Tool_Wear_Ratio']
        
        # Combined risk score
        df_eng['Combined_Risk_Score'] = (
            df_eng['HDF_Risk'] * 0.25 + 
            df_eng['PWF_Risk'] * 0.25 +
            df_eng['TWF_Risk'] * 0.25 + 
            df_eng['OSF_Risk'] * 0.25
        )
        
        # Encode Type
        df_eng['Type_encoded'] = self.type_encoder.transform(df_eng['Type'])
        
        return df_eng[self.feature_cols]

    def predict(self, sensor_data: dict) -> dict:
        """
        Make prediction for a single machine reading.
        
        Args:
            sensor_data: Dictionary with sensor readings:
                - Type: 'L', 'M', or 'H' (product quality type)
                - Air temperature: float (Kelvin, typically ~300K)
                - Process temperature: float (Kelvin, typically ~310K)
                - Rotational speed: int (RPM, typically 1200-2000)
                - Torque: float (Nm, typically 30-60)
                - Tool wear: int (minutes, 0-240)
        
        Returns:
            Dictionary with:
                - risk_score: Probability of failure (0-1)
                - failure_prediction: Whether failure is predicted
                - failure_type_probabilities: Probability of each failure type
                - most_likely_failure: The predicted failure type
                - recommended_action: What to do about it
                - feature_contributions: Which features influenced the prediction
        """
        # Convert to DataFrame
        df = pd.DataFrame([sensor_data])
        
        # Apply feature engineering
        X = self.engineer_features(df)
        
        # Binary prediction (will it fail?)
        failure_prob = self.binary_model.predict_proba(X)[0, 1]
        will_fail = failure_prob > 0.5
        
        # Multiclass prediction (what type of failure?)
        failure_type_probs = self.multiclass_model.predict_proba(X)[0]
        
        # ============================================
        # FIXED: Handle disagreement between models
        # When binary model says failure, we should NOT
        # return "No Failure" as the most likely type
        # ============================================
        if will_fail:
            # Binary model says FAILURE -> pick highest failure type (exclude "No Failure")
            # class_names = ['No Failure', 'TWF', 'HDF', 'PWF', 'OSF', 'RNF']
            # indices:         0            1      2      3      4      5
            failure_probs_only = failure_type_probs[1:]  # Exclude "No Failure" (index 0)
            failure_types_only = self.class_names[1:]    # ['TWF', 'HDF', 'PWF', 'OSF', 'RNF']
            
            most_likely_idx = np.argmax(failure_probs_only)
            most_likely_failure = failure_types_only[most_likely_idx]
        else:
            # Binary model says NO FAILURE
            most_likely_failure = None
        
        # Get feature contributions (if SHAP available)
        feature_contributions = []
        if self.explainer is not None:
            try:
                shap_values = self.explainer.shap_values(X)[0]
                top_indices = np.abs(shap_values).argsort()[::-1][:5]
                feature_contributions = [
                    {'feature': self.feature_cols[i], 'impact': float(shap_values[i])} 
                    for i in top_indices
                ]
            except Exception as e:
                print(f"SHAP explanation failed: {e}")
        
        # If no SHAP, use basic feature importance
        if not feature_contributions:
            importances = self.binary_model.feature_importances_
            top_indices = np.argsort(importances)[::-1][:5]
            feature_contributions = [
                {'feature': self.feature_cols[i], 'impact': float(importances[i])} 
                for i in top_indices
            ]
        
        return {
            'risk_score': float(failure_prob),
            'failure_prediction': {
                'will_fail': bool(will_fail),
                'confidence': float(failure_prob if will_fail else 1 - failure_prob)
            },
            'failure_type_probabilities': {
                name: float(prob) 
                for name, prob in zip(self.class_names, failure_type_probs)
            },
            'most_likely_failure': most_likely_failure,
            'recommended_action': self._get_recommendation(most_likely_failure, will_fail),
            'feature_contributions': feature_contributions
        }

    def _get_recommendation(self, failure_type: str, will_fail: bool) -> str:
        """Generate maintenance recommendation based on predicted failure type."""
        if not will_fail:
            return "Normal operation - continue monitoring"
        
        recommendations = {
            'TWF': "Schedule tool replacement - tool wear approaching critical level",
            'HDF': "Check cooling system - heat dissipation issue detected",
            'PWF': "Inspect power system - abnormal power consumption detected",
            'OSF': "Reduce load or replace tool - overstrain condition detected",
            'RNF': "Perform general inspection - random failure risk elevated",
            'No Failure': "Normal operation - continue monitoring"
        }
        return recommendations.get(failure_type, "Schedule preventive maintenance inspection")
    
    def predict_batch(self, sensor_data_list: list) -> list:
        """
        Make predictions for multiple machines.
        
        Args:
            sensor_data_list: List of sensor reading dictionaries
            
        Returns:
            List of prediction dictionaries
        """
        return [self.predict(data) for data in sensor_data_list]
    
    def get_model_info(self) -> dict:
        """Get information about the loaded models."""
        return {
            'model_dir': self.model_dir,
            'feature_count': len(self.feature_cols),
            'features': self.feature_cols,
            'failure_types': self.class_names,
            'shap_available': self.explainer is not None,
            'metadata': self.metadata if hasattr(self, 'metadata') else None
        }


# ============================================
# Test the inference if run directly
# ============================================

if __name__ == "__main__":
    print("Testing Predictive Maintenance Inference...")
    
    try:
        # Initialize inference engine
        inference = PredictiveMaintenanceInference('models')
        
        # Test prediction with a high-risk scenario
        test_data = {
            'Type': 'L',
            'Air temperature': 300.0,
            'Process temperature': 309.5,
            'Rotational speed': 1350,  # Low - potential HDF risk
            'Torque': 45.0,
            'Tool wear': 210  # High - potential TWF risk
        }
        
        print("\n[TEST INPUT]")
        for k, v in test_data.items():
            print(f"   {k}: {v}")
        
        result = inference.predict(test_data)
        
        print("\n[PREDICTION RESULT]")
        print(f"   Risk Score: {result['risk_score']:.1%}")
        print(f"   Will Fail: {result['failure_prediction']['will_fail']}")
        print(f"   Confidence: {result['failure_prediction']['confidence']:.1%}")
        print(f"   Most Likely Failure: {result['most_likely_failure']}")
        print(f"   Recommended Action: {result['recommended_action']}")
        
        print("\n[FAILURE TYPE PROBABILITIES]")
        for ftype, prob in result['failure_type_probabilities'].items():
            print(f"   {ftype}: {prob:.4f}")
        
        print("\n[TOP FEATURE CONTRIBUTIONS]")
        for contrib in result['feature_contributions'][:3]:
            impact_dir = "(+)" if contrib['impact'] > 0 else "(-)"
            print(f"   {contrib['feature']}: {impact_dir} {abs(contrib['impact']):.4f}")
        
        print("\n[OK] Inference test successful!")
        
    except FileNotFoundError as e:
        print(f"\n[ERROR] {e}")
        print("\nMake sure you have copied the models from the ML team to the 'models' directory.")
