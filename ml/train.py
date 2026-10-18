import os
import json
import numpy as np
import pandas as pd
from datetime import datetime

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve
)
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "diabetes.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
PLOTS_DIR = os.path.join(MODELS_DIR, "plots")
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)

FEATURE_COLUMNS = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age"
]

ZERO_IMPUTE_COLS = ["Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"]


def load_and_preprocess_data():
    print(f"[*] Loading dataset from {DATA_PATH}...")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    print(f"[*] Dataset shape: {df.shape}")

    # Compute population medians for biologically non-zero features (for inference imputation)
    imputer_medians = {}
    for col in ZERO_IMPUTE_COLS:
        non_zero_median = float(df[df[col] > 0][col].median())
        imputer_medians[col] = non_zero_median

    # Replace 0s with NaN and impute by median
    df_imputed = df.copy()
    for col in ZERO_IMPUTE_COLS:
        df_imputed[col] = df_imputed[col].replace(0, np.nan)
        # Impute with class-conditional medians for training data fidelity
        df_imputed[col] = df_imputed[col].fillna(
            df_imputed.groupby("Outcome")[col].transform("median")
        )

    X = df_imputed[FEATURE_COLUMNS]
    y = df_imputed["Outcome"]

    return df, X, y, imputer_medians


def train_and_evaluate():
    df_raw, X, y, imputer_medians = load_and_preprocess_data()

    # Stratified Train-Test Split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Feature Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Model candidates
    models = {
        "Random Forest": RandomForestClassifier(
            n_estimators=100, max_depth=6, min_samples_split=4, random_state=42
        ),
        "Gradient Boosting": GradientBoostingClassifier(
            n_estimators=100, learning_rate=0.08, max_depth=3, random_state=42
        ),
        "Logistic Regression": LogisticRegression(
            max_iter=1000, C=1.0, random_state=42
        ),
        "Support Vector Machine": SVC(
            kernel="rbf", C=1.0, probability=True, random_state=42
        ),
        "K-Nearest Neighbors": KNeighborsClassifier(
            n_neighbors=7
        )
    }

    leaderboard = []
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    print("\n--- Model Benchmark Comparison (5-Fold Stratified CV) ---")
    for name, model in models.items():
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        y_prob = model.predict_proba(X_test_scaled)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc = roc_auc_score(y_test, y_prob)
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=cv, scoring="roc_auc")

        entry = {
            "model_name": name,
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc), 4),
            "cv_roc_auc_mean": round(float(cv_scores.mean()), 4),
            "cv_roc_auc_std": round(float(cv_scores.std()), 4)
        }
        leaderboard.append(entry)
        print(f"| {name:<22} | Acc: {acc:.3f} | F1: {f1:.3f} | ROC-AUC: {roc:.3f} | CV ROC: {cv_scores.mean():.3f} +/- {cv_scores.std():.3f} |")

    # Hyperparameter Tuning on top ensemble candidate: Random Forest
    print("\n[*] Performing Hyperparameter Optimization (Random Forest)...", flush=True)
    param_grid = {
        "n_estimators": [100, 150],
        "max_depth": [5, 7, None],
        "min_samples_split": [2, 4],
    }
    rf = RandomForestClassifier(random_state=42)
    grid_search = GridSearchCV(
        rf, param_grid, cv=cv, scoring="roc_auc", n_jobs=1
    )
    grid_search.fit(X_train_scaled, y_train)
    best_model = grid_search.best_estimator_
    print(f"[*] Best Hyperparameters: {grid_search.best_params_}", flush=True)

    # Evaluate Best Model
    y_pred_best = best_model.predict(X_test_scaled)
    y_prob_best = best_model.predict_proba(X_test_scaled)[:, 1]

    best_acc = accuracy_score(y_test, y_pred_best)
    best_prec = precision_score(y_test, y_pred_best, zero_division=0)
    best_rec = recall_score(y_test, y_pred_best, zero_division=0)
    best_f1 = f1_score(y_test, y_pred_best, zero_division=0)
    best_roc = roc_auc_score(y_test, y_prob_best)

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred_best)
    tn, fp, fn, tp = cm.ravel()
    cm_dict = {
        "true_negatives": int(tn),
        "false_positives": int(fp),
        "false_negatives": int(fn),
        "true_positives": int(tp),
        "total_test_samples": int(len(y_test))
    }

    # ROC Curve
    fpr, tpr, thresholds = roc_curve(y_test, y_prob_best)
    # Downsample points for clean client-side charting
    indices = np.linspace(0, len(fpr) - 1, min(25, len(fpr)), dtype=int)
    roc_curve_data = [
        {"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)}
        for i in indices
    ]

    # Feature Importance
    importances = best_model.feature_importances_
    feature_importance_list = [
        {
            "feature": col,
            "importance": round(float(imp), 4),
            "percentage": round(float(imp * 100), 2)
        }
        for col, imp in sorted(
            zip(FEATURE_COLUMNS, importances), key=lambda x: x[1], reverse=True
        )
    ]

    # Save artifacts
    model_path = os.path.join(MODELS_DIR, "diabetes_model.joblib")
    scaler_path = os.path.join(MODELS_DIR, "scaler.joblib")
    medians_path = os.path.join(MODELS_DIR, "imputer_medians.json")
    metadata_path = os.path.join(MODELS_DIR, "model_metadata.json")

    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)

    with open(medians_path, "w") as f:
        json.dump(imputer_medians, f, indent=2)

    metadata = {
        "model_name": "Tuned Random Forest Classifier",
        "algorithm": "RandomForestClassifier",
        "version": "1.0.0",
        "trained_at": datetime.now().isoformat(),
        "dataset": {
            "name": "Pima Indians Diabetes Database",
            "total_samples": int(len(df_raw)),
            "features_count": len(FEATURE_COLUMNS),
            "diabetic_samples": int(df_raw["Outcome"].sum()),
            "non_diabetic_samples": int(len(df_raw) - df_raw["Outcome"].sum()),
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test))
        },
        "performance": {
            "accuracy": round(float(best_acc), 4),
            "precision": round(float(best_prec), 4),
            "recall": round(float(best_rec), 4),
            "f1_score": round(float(best_f1), 4),
            "roc_auc": round(float(best_roc), 4)
        },
        "confusion_matrix": cm_dict,
        "roc_curve": roc_curve_data,
        "feature_importance": feature_importance_list,
        "leaderboard": leaderboard,
        "features": FEATURE_COLUMNS,
        "best_hyperparameters": grid_search.best_params_
    }

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n[+] Model saved to: {model_path}")
    print(f"[+] Scaler saved to: {scaler_path}")
    print(f"[+] Metadata saved to: {metadata_path}")

    # Generate visual evaluation plots using matplotlib
    try:
        import matplotlib.pyplot as plt
        import seaborn as sns

        sns.set_theme(style="whitegrid")

        # 1. Feature Importance Plot
        plt.figure(figsize=(9, 5))
        features_sorted = [x["feature"] for x in feature_importance_list]
        importances_sorted = [x["percentage"] for x in feature_importance_list]
        sns.barplot(x=importances_sorted, y=features_sorted, palette="viridis")
        plt.title("Pima Diabetes Model - Feature Importance (%)", fontsize=14, pad=12)
        plt.xlabel("Relative Importance (%)")
        plt.tight_layout()
        plt.savefig(os.path.join(PLOTS_DIR, "feature_importance.png"), dpi=200)
        plt.close()

        # 2. Confusion Matrix Plot
        plt.figure(figsize=(6, 5))
        sns.heatmap(
            cm,
            annot=True,
            fmt="d",
            cmap="Blues",
            xticklabels=["Predicted Negative", "Predicted Positive"],
            yticklabels=["Actual Negative", "Actual Positive"]
        )
        plt.title(f"Confusion Matrix (Accuracy: {best_acc * 100:.1f}%)", fontsize=13, pad=12)
        plt.tight_layout()
        plt.savefig(os.path.join(PLOTS_DIR, "confusion_matrix.png"), dpi=200)
        plt.close()

        # 3. Model Comparison Plot
        plt.figure(figsize=(9, 4.5))
        model_names = [m["model_name"] for m in leaderboard]
        roc_aucs = [m["roc_auc"] for m in leaderboard]
        bars = plt.bar(model_names, roc_aucs, color=["#3b82f6", "#10b981", "#6366f1", "#f59e0b", "#ec4899"])
        plt.ylim(0.6, 1.0)
        plt.ylabel("ROC-AUC Score")
        plt.title("ML Algorithm Benchmark Comparison (Test ROC-AUC)", fontsize=13, pad=12)
        plt.xticks(rotation=15, ha="right")
        for bar in bars:
            yval = bar.get_height()
            plt.text(bar.get_x() + bar.get_width() / 2, yval + 0.008, f"{yval:.3f}", ha="center", va="bottom", fontsize=10)
        plt.tight_layout()
        plt.savefig(os.path.join(PLOTS_DIR, "model_comparison.png"), dpi=200)
        plt.close()

        print(f"[+] Diagnostic evaluation plots generated in {PLOTS_DIR}")
    except Exception as e:
        print(f"[-] Plotting skipped: {e}")

    return metadata


if __name__ == "__main__":
    train_and_evaluate()
