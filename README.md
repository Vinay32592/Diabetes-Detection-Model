# AI-Powered Diabetes Detection System (Machine Learning)

An end-to-end Machine Learning web application engineered for clinical diabetes screening and risk evaluation. Powered by a hyperparameter-optimized **Random Forest Classifier** trained on the **Pima Indians Diabetes Database**, served through a high-performance **FastAPI** Python REST API, and visualized with a modern **React + TypeScript** interface.

---

## Tech Stack

| Domain | Technologies |
|---|---|
| **Machine Learning** | Python 3.13, Scikit-Learn, Pandas, NumPy, Joblib |
| **Data Visualization & Analytics** | Matplotlib, Seaborn |
| **Backend REST API** | FastAPI, Uvicorn (ASGI), Pydantic v2 |
| **Persistence & History** | SQLite, SQLAlchemy ORM |
| **Frontend Application** | React 18, TypeScript, Vite, Lucide Icons, Modern CSS |

---

## Machine Learning Pipeline & Architecture

1. **Cohort Dataset**:
   - **Pima Indians Diabetes Database** (National Institute of Diabetes and Digestive and Kidney Diseases).
   - 768 patient records with 8 physiological biomarkers.
2. **Preprocessing & Missing Value Imputation**:
   - Biologically impossible zeroes in clinical lab measurements (`Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI`) are treated as missing values and imputed using class-conditional medians during training, and population medians during live inference.
3. **Feature Standardization**:
   - Continuous physiological features are standardized to zero-mean and unit-variance using `StandardScaler`.
4. **Model Benchmarking (5-Fold Stratified Cross-Validation)**:
   - 5 diverse machine learning algorithms were benchmarked:
     - **Tuned Random Forest Classifier** (Primary Active Model: **86.4% Accuracy, 0.950 ROC-AUC, 80.4% F1-Score**)
     - **Gradient Boosting Classifier** (87.0% Accuracy, 0.955 ROC-AUC)
     - **Support Vector Classifier (SVC)** (83.8% Accuracy, 0.897 ROC-AUC)
     - **K-Nearest Neighbors (k-NN)** (80.5% Accuracy, 0.868 ROC-AUC)
     - **Logistic Regression** (70.8% Accuracy, 0.826 ROC-AUC)
5. **Model Serialization**:
   - Serialized artifacts (`diabetes_model.joblib`, `scaler.joblib`, `model_metadata.json`, `imputer_medians.json`) enable sub-millisecond inference.
6. **Explainability**:
   - Relative Gini importance and individual patient biomarker contribution index for every prediction.

---

## Project Structure

```
Diabetes Detection/
├── ml/
│   ├── data/
│   │   └── diabetes.csv           # Pima Indians Diabetes Dataset (768 records)
│   ├── models/
│   │   ├── diabetes_model.joblib  # Trained Scikit-Learn ensemble model
│   │   ├── scaler.joblib          # Fitted StandardScaler
│   │   ├── imputer_medians.json   # Median values for missing lab imputation
│   │   ├── model_metadata.json    # Complete benchmark metrics, ROC & CM data
│   │   └── plots/                 # Matplotlib / Seaborn evaluation charts
│   │       ├── confusion_matrix.png
│   │       ├── feature_importance.png
│   │       └── model_comparison.png
│   ├── train.py                   # Model training & hyperparameter tuning pipeline
│   ├── predictor.py               # Real-time Python ML inference engine
│   └── eda.py                     # Exploratory Data Analysis script
├── backend/
│   ├── app.py                     # Flask REST API (serves Colab ML model)
│   ├── model.pkl                  # Trained SVM model from Colab
│   ├── scaler.pkl                 # Fitted StandardScaler from Colab
│   ├── requirements.txt           # Python backend dependencies
│   ├── .env                       # Environment configuration
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── simple-test.html       # Standalone HTML test client (zero npm setup)
│   ├── src/                       # React 18 + TypeScript source code
│   │   ├── components/            # Reusable UI components (ResultCard, Form, Navbar)
│   │   ├── pages/                 # Home, Prediction, ModelInsights, History
│   │   ├── services/              # API client (fetch, types)
│   │   ├── types/                 # TypeScript interfaces
│   │   └── index.css              # Custom styling & glassmorphism theme
│   ├── package.json
│   └── vite.config.ts
├── requirements.txt               # Root Python dependencies
└── README.md
```

---

## Getting Started

### 1. Prerequisites

- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 18+** & npm

---

### 2. Machine Learning Environment & Model Setup

1. Install Python ML dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. (Optional) Re-train the machine learning pipeline and evaluate all models:
   ```bash
   python ml/train.py
   ```
   This benchmarks all 5 algorithms, executes hyperparameter optimization on Random Forest, outputs evaluation metrics to `ml/models/model_metadata.json`, and exports diagnostic plots to `ml/models/plots/`.

3. (Optional) Run exploratory data analysis on the cohort:
   ```bash
   python ml/eda.py
   ```

---

### 3. Start the Machine Learning Backend Server

1. Launch the backend API:
   ```bash
   python backend/app.py
   ```
   The Flask ML server will start on **`http://127.0.0.1:5000`** and load your trained `model.pkl` and `scaler.pkl`.

---

### 4. Start the Frontend Application

1. Open a new terminal in the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will run on **`http://localhost:5173`**.

---

## API Endpoints Reference

### Health & Metadata
- `GET /` — API service check & technology stack metadata
- `GET /docs` — Interactive Swagger UI

### Machine Learning Predictions
- `POST /predict` — Submit 8 biomarker inputs to receive real-time ML inference, probability score, risk classification, and feature contribution indices.
- `GET /predict/history` — Fetch paginated list of logged patient evaluations with audit timestamps.
- `DELETE /predict/history/:id` — Delete a specific evaluation record from the database.

### Model Inspection & Metrics
- `GET /model/info` — Active model metadata, training timestamp, algorithm details, and hyperparameters.
- `GET /model/metrics` — Complete 5-model cross-validation leaderboard, confusion matrix, ROC-AUC curve coordinates, and global feature importance rankings.
- `GET /model/plots/:plot_name` — Serve generated diagnostic plots (`feature_importance.png`, `confusion_matrix.png`, `model_comparison.png`).

---

## Medical Disclaimer

This project is an academic and educational data science tool. Machine learning predictions are generated statistically from observational research data and do not substitute for formal medical diagnoses or laboratory tests conducted by licensed physicians.
