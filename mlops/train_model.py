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
        X, y, test_size=0.2, random_state=99
    )
    
    print(f"Training data shape: {X_train.shape}")
    
    # Create a Random Forest classifier with custom parameters
    model = RandomForestClassifier(
        n_estimators=120, 
        max_depth=10,
        min_samples_split=3,
        random_state=99
    )
    
    # Train the model
    print("Training model...")
    model.fit(X_train, y_train)
    
    # Make predictions on the test set
    y_pred = model.predict(X_test)
    
    # Evaluate the model
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=iris.target_names))
    
    # Save the model
    model_path = os.path.join(os.path.dirname(__file__), "iris_model.pkl")
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    
    return model

if __name__ == "__main__":
    train_iris_model() 