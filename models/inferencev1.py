import numpy as np
import pandas as pd
import joblib
import json
import shap


class PredictiveMaintenanceInference:
    """
    Inference class for the Predictive Maintenance Copilot.
    
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

    def __init__(self, model_dir='models'):
        self.binary_model = joblib.load(f'{model_dir}/binary_failure_model.joblib')
        self.multiclass_model = joblib.load(f'{model_dir}/multiclass_failure_model.joblib')
        self.type_encoder = joblib.load(f'{model_dir}/type_encoder.joblib')

        with open(f'{model_dir}/model_metadata.json', 'r') as f:
            self.metadata = json.load(f)

        self.feature_cols = self.metadata['feature_columns']
        self.class_names = ['No Failure', 'TWF', 'HDF', 'PWF', 'OSF', 'RNF']
        self.explainer = shap.TreeExplainer(self.binary_model)

    def engineer_features(self, df):
        """Apply feature engineering to input data."""
        df_eng = df.copy()
        
        df_eng['Temp_Diff'] = df_eng['Process temperature'] - df_eng['Air temperature']
        df_eng['Temp_Ratio'] = df_eng['Process temperature'] / df_eng['Air temperature']
        df_eng['Power'] = df_eng['Torque'] * df_eng['Rotational speed'] * 2 * np.pi / 60
        df_eng['Overstrain'] = df_eng['Tool wear'] * df_eng['Torque']
        
        df_eng['Temp_Risk'] = (df_eng['Temp_Diff'] < 8.6).astype(int)
        df_eng['Speed_Risk'] = (df_eng['Rotational speed'] < 1380).astype(int)
        df_eng['HDF_Risk'] = df_eng['Temp_Risk'] * df_eng['Speed_Risk']
        
        df_eng['Power_Low'] = (df_eng['Power'] < 3500).astype(int)
        df_eng['Power_High'] = (df_eng['Power'] > 9000).astype(int)
        df_eng['PWF_Risk'] = ((df_eng['Power'] < 3500) | (df_eng['Power'] > 9000)).astype(int)
        
        df_eng['Tool_Wear_Ratio'] = df_eng['Tool wear'] / 240
        df_eng['TWF_Risk'] = ((df_eng['Tool wear'] >= 200) & (df_eng['Tool wear'] <= 240)).astype(int)

        def calc_osf_risk(row):
            thresholds = {'L': 11000, 'M': 12000, 'H': 13000}
            return row['Overstrain'] / thresholds.get(row['Type'], 12000)

        df_eng['OSF_Risk_Ratio'] = df_eng.apply(calc_osf_risk, axis=1)
        df_eng['OSF_Risk'] = (df_eng['OSF_Risk_Ratio'] > 1).astype(int)
        
        df_eng['Speed_Torque_Ratio'] = df_eng['Rotational speed'] / (df_eng['Torque'] + 1)
        df_eng['Torque_Wear_Interaction'] = df_eng['Torque'] * df_eng['Tool_Wear_Ratio']
        df_eng['Combined_Risk_Score'] = (df_eng['HDF_Risk'] * 0.25 + df_eng['PWF_Risk'] * 0.25 +
                                         df_eng['TWF_Risk'] * 0.25 + df_eng['OSF_Risk'] * 0.25)
        
        df_eng['Type_encoded'] = self.type_encoder.transform(df_eng['Type'])
        return df_eng[self.feature_cols]

    def predict(self, sensor_data: dict) -> dict:
        """
        Make prediction for a single machine reading.
        
        Args:
            sensor_data: Dictionary with keys:
                - Type: 'L', 'M', or 'H'
                - Air temperature: float (Kelvin)
                - Process temperature: float (Kelvin)
                - Rotational speed: int (rpm)
                - Torque: float (Nm)
                - Tool wear: int (minutes)
        
        Returns:
            Dictionary with prediction results and explanations
        """
        df = pd.DataFrame([sensor_data])
        X = self.engineer_features(df)

        failure_prob = self.binary_model.predict_proba(X)[0, 1]
        will_fail = failure_prob > 0.5

        failure_type_probs = self.multiclass_model.predict_proba(X)[0]
        most_likely_failure = self.class_names[np.argmax(failure_type_probs)]

        shap_values = self.explainer.shap_values(X)[0]
        top_indices = np.abs(shap_values).argsort()[::-1][:5]

        return {
            'risk_score': float(failure_prob),
            'failure_prediction': {
                'will_fail': bool(will_fail),
                'confidence': float(failure_prob if will_fail else 1 - failure_prob)
            },
            'failure_type_probabilities': {
                name: float(prob) for name, prob in zip(self.class_names, failure_type_probs)
            },
            'most_likely_failure': most_likely_failure if will_fail else None,
            'recommended_action': self._get_recommendation(most_likely_failure, will_fail),
            'feature_contributions': [
                {'feature': self.feature_cols[i], 'impact': float(shap_values[i])} 
                for i in top_indices
            ]
        }

    def _get_recommendation(self, failure_type, will_fail):
        """Generate maintenance recommendation based on predicted failure type."""
        if not will_fail:
            return "Normal operation - continue monitoring"
        
        recommendations = {
            'TWF': "Schedule tool replacement - tool wear approaching critical level",
            'HDF': "Check cooling system - heat dissipation issue detected",
            'PWF': "Inspect power system - abnormal power consumption detected",
            'OSF': "Reduce load or replace tool - overstrain condition detected",
            'RNF': "Perform general inspection - random failure risk elevated",
        }
        return recommendations.get(failure_type, "Schedule preventive maintenance inspection")


if __name__ == "__main__":
    # Test the inference
    inference = PredictiveMaintenanceInference()
    
    test_data = {
        'Type': 'L',
        'Air temperature': 300.0,
        'Process temperature': 309.5,
        'Rotational speed': 1350,
        'Torque': 45.0,
        'Tool wear': 210
    }
    
    result = inference.predict(test_data)
    print(json.dumps(result, indent=2))
