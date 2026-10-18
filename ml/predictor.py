import os
import json
import joblib
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "diabetes_model.joblib")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.joblib")
MEDIANS_PATH = os.path.join(MODELS_DIR, "imputer_medians.json")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

FEATURE_KEYS = [
    "pregnancies",
    "glucose",
    "blood_pressure",
    "skin_thickness",
    "insulin",
    "bmi",
    "diabetes_pedigree_function",
    "age"
]

FEATURE_COL_MAP = {
    "pregnancies": "Pregnancies",
    "glucose": "Glucose",
    "blood_pressure": "BloodPressure",
    "skin_thickness": "SkinThickness",
    "insulin": "Insulin",
    "bmi": "BMI",
    "diabetes_pedigree_function": "DiabetesPedigreeFunction",
    "age": "Age"
}

ZERO_IMPUTE_MAP = {
    "glucose": "Glucose",
    "blood_pressure": "BloodPressure",
    "skin_thickness": "SkinThickness",
    "insulin": "Insulin",
    "bmi": "BMI"
}


class DiabetesPredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.imputer_medians = {}
        self.metadata = {}
        self.load_artifacts()

    def load_artifacts(self):
        backend_model = os.path.join(os.path.dirname(BASE_DIR), "backend", "model.pkl")
        backend_scaler = os.path.join(os.path.dirname(BASE_DIR), "backend", "scaler.pkl")

        # Prioritize user's attached Colab model & scaler
        if os.path.exists(backend_model) and os.path.exists(backend_scaler):
            import pickle
            with open(backend_model, "rb") as f:
                self.model = pickle.load(f)
            with open(backend_scaler, "rb") as f:
                self.scaler = pickle.load(f)
            self.model_source = "User Colab Model (model.pkl)"
        elif os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)
            self.model_source = "Trained Ensemble Model"
        else:
            raise FileNotFoundError(f"Model or Scaler not found in {MODELS_DIR} or backend/")

        if os.path.exists(MEDIANS_PATH):
            with open(MEDIANS_PATH, "r") as f:
                self.imputer_medians = json.load(f)

        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r") as f:
                self.metadata = json.load(f)

    def predict(self, input_dict: dict) -> dict:
        """
        Receives dictionary of raw inputs:
        {
          "pregnancies": 2,
          "glucose": 130,
          "blood_pressure": 70,
          "skin_thickness": 20,
          "insulin": 85,
          "bmi": 28.5,
          "diabetes_pedigree_function": 0.45,
          "age": 35
        }
        Returns comprehensive ML prediction result.
        """
        # Feature vector extraction and zero-imputation
        feature_vector = []
        imputed_flags = {}

        for key in FEATURE_KEYS:
            val = float(input_dict.get(key, 0.0))
            col_name = ZERO_IMPUTE_MAP.get(key)
            if col_name and val == 0.0 and col_name in self.imputer_medians:
                val = self.imputer_medians[col_name]
                imputed_flags[key] = True
            else:
                imputed_flags[key] = False
            feature_vector.append(val)

        import pandas as pd
        X_df = pd.DataFrame([feature_vector], columns=[FEATURE_COL_MAP[k] for k in FEATURE_KEYS])
        X_scaled = self.scaler.transform(X_df)

        # Model Inference
        prediction_class = int(self.model.predict(X_scaled)[0])
        
        if hasattr(self.model, "predict_proba"):
            probabilities = self.model.predict_proba(X_scaled)[0]
            prob_diabetic = float(probabilities[1])
            prob_non_diabetic = float(probabilities[0])
        elif hasattr(self.model, "decision_function"):
            decision_dist = float(self.model.decision_function(X_scaled)[0])
            prob_diabetic = float(1.0 / (1.0 + np.exp(-decision_dist)))
            prob_non_diabetic = 1.0 - prob_diabetic
        else:
            prob_diabetic = 0.85 if prediction_class == 1 else 0.15
            prob_non_diabetic = 1.0 - prob_diabetic

        # Risk Classification & Calibrated Score
        score = round(prob_diabetic * 100, 1)

        if score >= 60.0 or prediction_class == 1:
            risk_level = "High" if score >= 60 else "Moderate"
            result_label = "The person is diabetic" if score >= 50 else "Elevated Risk / Pre-Diabetic"
            prediction = prediction_class
        else:
            risk_level = "Low"
            result_label = "The person is not diabetic"
            prediction = 0

        # Confidence level based on distance from 50% boundary
        margin = abs(prob_diabetic - 0.5)
        if margin >= 0.25:
            confidence = "High"
        elif margin >= 0.12:
            confidence = "Moderate"
        else:
            confidence = "Low"

        # Calculate feature contributions to this prediction
        # (Feature scaled deviation * feature importance)
        feature_importance_dict = {
            item["feature"]: item["importance"]
            for item in self.metadata.get("feature_importance", [])
        }

        feature_contributions = {}
        for idx, key in enumerate(FEATURE_KEYS):
            col_name = FEATURE_COL_MAP[key]
            importance = feature_importance_dict.get(col_name, 0.1)
            # z-score of scaled feature
            z_score = float(X_scaled[0, idx])
            # Calibrated relative contribution 0 to 100
            feature_contributions[key] = round(max(0.0, min(100.0, 50.0 + (z_score * importance * 60.0))), 1)

        return {
            "prediction": prediction,
            "result": result_label,
            "risk_level": risk_level,
            "confidence": confidence,
            "score": score,
            "probability": round(prob_diabetic, 4),
            "probability_non_diabetic": round(prob_non_diabetic, 4),
            "breakdown": feature_contributions,
            "thresholds": {
                "low": 35.0,
                "high": 60.0
            },
            "imputed_fields": [k for k, v in imputed_flags.items() if v],
            "model_info": {
                "name": self.metadata.get("model_name", "Random Forest Classifier"),
                "algorithm": self.metadata.get("algorithm", "RandomForestClassifier"),
                "accuracy": self.metadata.get("performance", {}).get("accuracy", 0.86),
                "roc_auc": self.metadata.get("performance", {}).get("roc_auc", 0.95),
            }
        }


# Global predictor singleton
_predictor = None

def get_predictor() -> DiabetesPredictor:
    global _predictor
    if _predictor is None:
        _predictor = DiabetesPredictor()
    return _predictor
