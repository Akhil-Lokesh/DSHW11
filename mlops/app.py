from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import uvicorn
import os

# Initialize FastAPI app
app = FastAPI(
    title="Iris Classification API",
    description="A simple API for Iris flower classification",
    version="1.0.0"
)

# Define the model path
model_path = os.path.join(os.path.dirname(__file__), "iris_model.pkl")

# Load the model
try:
    model = joblib.load(model_path)
    print(f"Model loaded successfully from {model_path}")
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# Define input data model based on Iris features
class IrisFeatures(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float
    
    class Config:
        schema_extra = {
            "example": {
                "sepal_length": 5.1,
                "sepal_width": 3.5,
                "petal_length": 1.4,
                "petal_width": 0.2
            }
        }

# Define output model for predictions
class PredictionResponse(BaseModel):
    prediction: int
    species: str
    probability: float

# Map numeric predictions to species names
SPECIES_MAP = {
    0: "setosa",
    1: "versicolor",
    2: "virginica"
}

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to the Iris Classification API. Use /predict endpoint to make predictions."}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

# Prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict(features: IrisFeatures):
    try:
        # Convert input features to numpy array
        data = np.array([[
            features.sepal_length,
            features.sepal_width,
            features.petal_length,
            features.petal_width
        ]])
        
        # Make prediction
        prediction = int(model.predict(data)[0])
        probabilities = model.predict_proba(data)[0]
        max_probability = float(max(probabilities))
        
        # Return prediction result
        return {
            "prediction": prediction,
            "species": SPECIES_MAP[prediction],
            "probability": max_probability
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True) 