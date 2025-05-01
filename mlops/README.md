# Iris Classification Model API

A simple MLOps project that demonstrates how to train, save, and serve a machine learning model using FastAPI.

## Overview

This project implements a machine learning pipeline for Iris flower classification with the following components:

- **Model Training**: Uses scikit-learn's RandomForest classifier to train on the Iris dataset
- **Model Serving**: Provides a FastAPI-based prediction endpoint
- **CI Pipeline**: GitHub Actions workflow to test model training and API functionality

## Project Structure

```
mlops/
├── app.py               # FastAPI application with prediction endpoint
├── train_model.py       # Script to train and save the model
├── iris_model.pkl       # Saved model file (generated after training)
├── requirements.txt     # Python dependencies
└── .github/workflows/   # CI workflow configuration
```

## Setup and Usage

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

### Training the Model

Run the following command to train the model:
```
python train_model.py
```

This will:
- Load the Iris dataset
- Train a RandomForest classifier
- Evaluate model performance
- Save the model as `iris_model.pkl`

### Running the API

Start the FastAPI server:
```
uvicorn app:app --reload
```

The API will be available at http://localhost:8000 with the following endpoints:
- `/`: Welcome message
- `/docs`: Interactive API documentation (Swagger UI)
- `/health`: Health check endpoint
- `/predict`: Prediction endpoint (POST)

### Making Predictions

You can make predictions using the `/predict` endpoint by sending a POST request with the following JSON format:

```json
{
  "sepal_length": 5.1,
  "sepal_width": 3.5,
  "petal_length": 1.4,
  "petal_width": 0.2
}
```

## CI/CD Pipeline

The GitHub Actions workflow automatically:
1. Sets up a Python environment
2. Installs dependencies
3. Trains the model
4. Verifies the model can be loaded and used for predictions
5. Tests the FastAPI application startup
6. Uploads the model as an artifact 