"""
Predictive Maintenance FastAPI Service
======================================
This FastAPI service provides ML inference endpoints for the predictive maintenance system.
It wraps the inference.py module and exposes it via REST API.

Endpoints:
- POST /api/predict - Single machine prediction
- POST /api/predict/batch - Batch predictions
- GET /health - Health check
- GET /api/model/info - Model information
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uvicorn
import sys
import os

# Add models directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'models'))
from inference import PredictiveMaintenanceInference

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Predictive Maintenance API",
    description="ML inference service for predictive maintenance",
    version="1.0.0"
)

# CORS middleware for Hapi.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global inference engine
inference_engine: Optional[PredictiveMaintenanceInference] = None


# ============================================
# Pydantic Models
# ============================================

class SensorData(BaseModel):
    """Input model for sensor readings"""
    machine_id: Optional[str] = Field(None, description="Machine identifier (optional)")
    Type: str = Field(..., description="Product quality: L, M, or H", pattern="^[LMH]$")
    air_temperature: float = Field(..., alias="Air temperature", description="Air temperature in Kelvin", ge=0, le=400)
    process_temperature: float = Field(..., alias="Process temperature", description="Process temperature in Kelvin", ge=0, le=400)
    rotational_speed: int = Field(..., alias="Rotational speed", description="Rotational speed in RPM", ge=0, le=10000)
    torque: float = Field(..., alias="Torque", description="Torque in Nm", ge=0, le=200)
    tool_wear: int = Field(..., alias="Tool wear", description="Tool wear in minutes", ge=0, le=300)
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "machine_id": "machine_001",
                "Type": "L",
                "Air temperature": 300.0,
                "Process temperature": 309.5,
                "Rotational speed": 1350,
                "Torque": 45.0,
                "Tool wear": 210
            }
        }


class PredictionResponse(BaseModel):
    """Output model for predictions"""
    machine_id: Optional[str] = None
    risk_score: float = Field(..., description="Probability of failure (0-1)")
    failure_prediction: Dict[str, Any] = Field(..., description="Will fail and confidence")
    failure_type_probabilities: Dict[str, float] = Field(..., description="Probability of each failure type")
    most_likely_failure: Optional[str] = Field(None, description="Most likely failure type")
    recommended_action: str = Field(..., description="Maintenance recommendation")
    feature_contributions: List[Dict[str, Any]] = Field(..., description="Top contributing features")


class BatchPredictionRequest(BaseModel):
    """Input model for batch predictions"""
    sensor_data: List[SensorData]


class BatchPredictionResponse(BaseModel):
    """Output model for batch predictions"""
    predictions: List[PredictionResponse]
    total_count: int


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    model_loaded: bool
    message: str


class ModelInfoResponse(BaseModel):
    """Model information response"""
    model_dir: str
    feature_count: int
    features: List[str]
    failure_types: List[str]
    shap_available: bool


# ============================================
# Startup/Shutdown Events
# ============================================

@app.on_event("startup")
async def startup_event():
    """Load ML models on startup"""
    global inference_engine
    try:
        model_dir = os.getenv("MODEL_DIR", "models")
        inference_engine = PredictiveMaintenanceInference(model_dir)
        print(f"✅ Inference engine loaded from '{model_dir}'")
    except Exception as e:
        print(f"❌ Failed to load inference engine: {e}")
        inference_engine = None


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🛑 Shutting down FastAPI service...")


# ============================================
# API Endpoints
# ============================================

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Predictive Maintenance API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Check if the service and models are loaded"""
    if inference_engine is None:
        return HealthResponse(
            status="unhealthy",
            model_loaded=False,
            message="ML models not loaded"
        )
    
    return HealthResponse(
        status="healthy",
        model_loaded=True,
        message="Service is running and models are loaded"
    )


@app.post("/api/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict(sensor_data: SensorData):
    """
    Make a prediction for a single machine.
    
    This endpoint accepts sensor readings and returns:
    - Risk score (probability of failure)
    - Failure type predictions
    - Maintenance recommendations
    - Feature importance explanations
    """
    if inference_engine is None:
        raise HTTPException(status_code=503, detail="ML models not loaded")
    
    try:
        # Convert Pydantic model to dict for inference
        input_dict = {
            "Type": sensor_data.Type,
            "Air temperature": sensor_data.air_temperature,
            "Process temperature": sensor_data.process_temperature,
            "Rotational speed": sensor_data.rotational_speed,
            "Torque": sensor_data.torque,
            "Tool wear": sensor_data.tool_wear
        }
        
        # Run inference
        result = inference_engine.predict(input_dict)
        
        # Add machine_id if provided
        result["machine_id"] = sensor_data.machine_id
        
        return PredictionResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/api/predict/batch", response_model=BatchPredictionResponse, tags=["Prediction"])
async def predict_batch(request: BatchPredictionRequest):
    """
    Make predictions for multiple machines.
    
    This endpoint accepts an array of sensor readings and returns
    predictions for each machine.
    """
    if inference_engine is None:
        raise HTTPException(status_code=503, detail="ML models not loaded")
    
    try:
        predictions = []
        
        for sensor_data in request.sensor_data:
            # Convert to dict
            input_dict = {
                "Type": sensor_data.Type,
                "Air temperature": sensor_data.air_temperature,
                "Process temperature": sensor_data.process_temperature,
                "Rotational speed": sensor_data.rotational_speed,
                "Torque": sensor_data.torque,
                "Tool wear": sensor_data.tool_wear
            }
            
            # Run inference
            result = inference_engine.predict(input_dict)
            result["machine_id"] = sensor_data.machine_id
            predictions.append(PredictionResponse(**result))
        
        return BatchPredictionResponse(
            predictions=predictions,
            total_count=len(predictions)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")


@app.get("/api/model/info", response_model=ModelInfoResponse, tags=["Model"])
async def get_model_info():
    """
    Get information about the loaded ML models.
    
    Returns model metadata, feature list, and configuration details.
    """
    if inference_engine is None:
        raise HTTPException(status_code=503, detail="ML models not loaded")
    
    try:
        info = inference_engine.get_model_info()
        return ModelInfoResponse(
            model_dir=info["model_dir"],
            feature_count=info["feature_count"],
            features=info["features"],
            failure_types=info["failure_types"],
            shap_available=info["shap_available"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")


# ============================================
# Main Entry Point
# ============================================

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("FASTAPIHOST", "localhost")
    port = int(os.getenv("FASTAPIPORT", "8001"))
    
    print(f"🚀 Starting Predictive Maintenance API on {host}:{port}")
    print(f"📚 API Documentation: http://{host}:{port}/docs")
    print(f"🔍 Health Check: http://{host}:{port}/health")
    
    uvicorn.run(
        "fastapi_main:app",
        host=host,
        port=port,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )
