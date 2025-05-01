import numpy as np
import pandas as pd
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def train_iris_model():
    """
    Train a RandomForest classifier on the Iris dataset and save it as a pickle file.
    """
    print("Loading Iris dataset...")
    # Load the iris dataset
    iris = load_iris()
    X = iris.data
    y = iris.target
    
    # Split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42
    )
    
    print(f"Training data shape: {X_train.shape}")
    
    # Create a Random Forest classifier
    # Using different hyperparameters to make it slightly unique
    model = RandomForestClassifier(
        n_estimators=120,
        max_depth=7,
        min_samples_split=3,
        min_samples_leaf=2,
        random_state=21
    )
    
    # Train the model
    print("Training model...")
    model.fit(X_train, y_train)
    
    # Evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model accuracy: {accuracy:.4f}")
    
    # Print detailed classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=iris.target_names))
    
    # Save the model
    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, "model.pkl")
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    
    return model, model_path

if __name__ == "__main__":
    model, model_path = train_iris_model()
    
    # Verify the model can be loaded
    loaded_model = joblib.load(model_path)
    print("Model loaded successfully for verification")
    
    # Test with a sample prediction
    sample = np.array([[5.1, 3.5, 1.4, 0.2]])  # Sample Iris-Setosa
    prediction = loaded_model.predict(sample)
    print(f"Sample prediction test: {prediction} (Expected: 0 - Setosa)") 