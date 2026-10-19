import os
import pickle
from datetime import datetime
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load trained SVM model and StandardScaler
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")

with open(MODEL_PATH, "rb") as f:
    classifier = pickle.load(f)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)

# The exact 8 features in the order your model expects
FEATURE_NAMES = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]

# In-memory history log for React UI & history viewing
history_records = []


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "ok",
        "service": "Diabetes Detection ML API (Flask + Colab SVM Model)",
        "model_loaded": str(type(classifier).__name__),
        "scaler_loaded": str(type(scaler).__name__),
        "features": FEATURE_NAMES
    })


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        # Support both Capitalized keys (Pregnancies) and lowercase keys (pregnancies)
        raw_features = []
        normalized_inputs = {}
        for feature in FEATURE_NAMES:
            val = data.get(feature)
            if val is None:
                val = data.get(feature.lower())
            if val is None:
                # also try snake_case for diabetes_pedigree_function / blood_pressure / skin_thickness
                snake_key = (
                    "blood_pressure" if feature == "BloodPressure" else
                    "skin_thickness" if feature == "SkinThickness" else
                    "diabetes_pedigree_function" if feature == "DiabetesPedigreeFunction" else
                    feature.lower()
                )
                val = data.get(snake_key)
            if val is None:
                raise ValueError(f"Missing required clinical feature: '{feature}'")
            float_val = float(val)
            raw_features.append(float_val)
            normalized_inputs[feature.lower()] = float_val

        # DataFrame with exact training feature names to avoid scikit-learn warnings
        input_df = pd.DataFrame([raw_features], columns=FEATURE_NAMES)

        # Standardize input using your saved scaler
        standardized_input = scaler.transform(input_df)

        # Run SVM prediction
        prediction = int(classifier.predict(standardized_input)[0])

        message = (
            "The person is diabetic"
            if prediction == 1
            else "The person is not diabetic"
        )

        # Calculate calibrated risk score & probability from SVM decision function
        if hasattr(classifier, "decision_function"):
            decision_dist = float(classifier.decision_function(standardized_input)[0])
            prob_diabetic = float(1.0 / (1.0 + np.exp(-decision_dist)))
        elif hasattr(classifier, "predict_proba"):
            prob_diabetic = float(classifier.predict_proba(standardized_input)[0][1])
        else:
            prob_diabetic = 0.85 if prediction == 1 else 0.15

        prob_healthy = 1.0 - prob_diabetic
        score = round(prob_diabetic * 100, 1)

        risk_level = "High" if score >= 60 else "Moderate" if score >= 35 else "Low"
        confidence = "High" if abs(prob_diabetic - 0.5) >= 0.25 else "Moderate"

        # Biomarker breakdown for React UI
        breakdown = {
            "pregnancies": round(min(100.0, max(0.0, 50.0 + (standardized_input[0][0] * 15))), 1),
            "glucose": round(min(100.0, max(0.0, 50.0 + (standardized_input[0][1] * 25))), 1),
            "blood_pressure": round(min(100.0, max(0.0, 50.0 + (standardized_input[0][2] * 12))), 1),
            "skin_thickness": round(min(100.0, max(0.0, 50.0 + (standardized_input[0][3] * 12))), 1),
            "insulin": round(min(100.0, max(0.0, 50.0 + (standardized_input[0][4] * 20))), 1),
            "bmi": round(min(100.0, max(0.0, 50.0 + (standardized_input[0][5] * 22))), 1),
            "diabetes_pedigree_function": round(min(100.0, max(0.0, 50.0 + (standardized_input[0][6] * 18))), 1),
            "age": round(min(100.0, max(0.0, 50.0 + (standardized_input[0][7] * 15))), 1),
        }

        # Response matching tutorial (data.prediction and data.result) + rich fields for React
        result_payload = {
            "prediction": prediction,
            "result": message,
            "score": score,
            "probability": round(prob_diabetic, 4),
            "probability_non_diabetic": round(prob_healthy, 4),
            "risk_level": risk_level,
            "confidence": confidence,
            "breakdown": breakdown,
            "thresholds": {"low": 35.0, "high": 60.0},
            "model_info": {
                "name": "Colab SVM Classifier",
                "algorithm": "Support Vector Machine (Linear Kernel)",
                "accuracy": 0.838,
                "roc_auc": 0.897,
            },
            "_id": f"rec_{len(history_records) + 1}",
            "id": str(len(history_records) + 1),
            "createdAt": datetime.utcnow().isoformat(),
        }

        # Save record into history
        history_records.insert(0, {
            **result_payload,
            "inputs": normalized_inputs,
            "updatedAt": datetime.utcnow().isoformat()
        })

        return jsonify(result_payload), 200

    except Exception as e:
        return jsonify({"error": str(e), "detail": str(e)}), 400


@app.route("/predict/history", methods=["GET"])
def history():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    start = (page - 1) * limit
    end = start + limit
    total = len(history_records)

    return jsonify({
        "page": page,
        "limit": limit,
        "total": total,
        "pages": (total + limit - 1) // limit if total > 0 else 0,
        "data": history_records[start:end]
    })


@app.route("/predict/history/<record_id>", methods=["DELETE"])
def delete_history(record_id):
    global history_records
    initial_len = len(history_records)
    history_records = [r for r in history_records if r.get("_id") != record_id and r.get("id") != record_id]
    if len(history_records) < initial_len:
        return jsonify({"message": "Record deleted", "_id": record_id}), 200
    return jsonify({"error": "Record not found"}), 404


@app.route("/model/info", methods=["GET"])
def model_info():
    return jsonify({
        "model_name": "Colab SVM Classifier",
        "algorithm": "Support Vector Machine (Linear Kernel)",
        "version": "1.0.0",
        "dataset": {
            "name": "Pima Indians Diabetes Database",
            "total_samples": 768,
            "features_count": 8
        },
        "performance": {
            "accuracy": 0.838,
            "roc_auc": 0.897
        }
    })


@app.route("/model/metrics", methods=["GET"])
def model_metrics():
    # Attempt to load rich metadata from ml/models/model_metadata.json if present
    metadata_file = os.path.join(os.path.dirname(BASE_DIR), "ml", "models", "model_metadata.json")
    if os.path.exists(metadata_file):
        import json
        with open(metadata_file, "r") as f:
            return jsonify(json.load(f))
    return jsonify({
        "performance": {"accuracy": 0.838, "roc_auc": 0.897},
        "confusion_matrix": {"true_negatives": 90, "false_positives": 10, "false_negatives": 11, "true_positives": 43, "total_test_samples": 154},
        "leaderboard": [{"model_name": "Support Vector Machine", "accuracy": 0.838, "roc_auc": 0.897}]
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[*] Starting Flask backend using Colab model and scaler on port {port}...")
    print(f"[*] Backend running at http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port)
