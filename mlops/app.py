from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
import uvicorn
import os

# Initialize FastAPI app
app = FastAPI(
    title="ML Prediction API",
    description="A simple prediction API using FastAPI",
    version="1.0.0"
)

# Check if model file exists, this will help in CI pipeline
model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found at {model_path}")

# Load the model
try:
    model = joblib.load(model_path)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# Define input data model
class IrisFeatures(BaseModel):
    sepal_length: float
    sepal_width: float
    petal_length: float
    petal_width: float

# Define prediction response model
class PredictionResponse(BaseModel):
    prediction: int
    predicted_class: str
    confidence: float

# Mapping for iris class names
class_names = {
    0: "Setosa",
    1: "Versicolor",
    2: "Virginica"
}

@app.get("/")
def read_root():
    return {"message": "ML Prediction API is running. Use /predict endpoint for predictions."}

@app.post("/predict", response_model=PredictionResponse)
def predict(features: IrisFeatures):
    try:
        # Convert input to numpy array
        input_data = np.array([
            features.sepal_length,
            features.sepal_width,
            features.petal_length,
            features.petal_width
        ]).reshape(1, -1)
        
        # Make prediction
        prediction = int(model.predict(input_data)[0])
        
        # Get prediction probabilities if model supports it
        try:
            probabilities = model.predict_proba(input_data)[0]
            confidence = float(probabilities[prediction])
        except:
            confidence = 1.0  # Default confidence if predict_proba not available
        
        # Return prediction with class name and confidence
        return {
            "prediction": prediction,
            "predicted_class": class_names[prediction],
            "confidence": confidence
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/health")
def health_check():
    """Health check endpoint for CI verification"""
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
