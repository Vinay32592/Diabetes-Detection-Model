# AI-Powered Diabetes Detection System (Machine Learning)

[![Frontend on Vercel](https://img.shields.io/badge/Frontend-Vercel%20Live-black?style=for-the-badge&logo=vercel)](https://diabetes-detection-model-pi.vercel.app/)
[![Backend on Render](https://img.shields.io/badge/Backend-Render%20Live-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://diabetes-detection-model-rkzs.onrender.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Vinay32592/Diabetes-Detection-Model)
[![Python 3.13](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

An end-to-end Machine Learning web application engineered for clinical diabetes screening and risk evaluation. Powered by a hyperparameter-optimized **Support Vector Machine (SVM) Classifier** trained on the **Pima Indians Diabetes Database**, served through a high-performance **Flask + Gunicorn** Python REST API on **Render**, and visualized with a responsive **React + TypeScript + Vite** interface deployed on **Vercel**.

---

## Live Deployments

- 🌐 **Live Web Application (Frontend)**: [https://diabetes-detection-model-pi.vercel.app/](https://diabetes-detection-model-pi.vercel.app/)
- 🚀 **Live ML REST API (Backend)**: [https://diabetes-detection-model-rkzs.onrender.com/](https://diabetes-detection-model-rkzs.onrender.com/)
- 📦 **GitHub Repository**: [https://github.com/Vinay32592/Diabetes-Detection-Model](https://github.com/Vinay32592/Diabetes-Detection-Model)

---

## Tech Stack

| Domain | Technologies |
|---|---|
| **Machine Learning** | Python 3.13, Scikit-Learn (SVM / SVC), Pandas, NumPy, StandardScaler |
| **Data Analytics** | Matplotlib, Seaborn, Cross-Validation |
| **Backend REST API** | Flask, Flask-CORS, Gunicorn (Production WSGI) |
| **Frontend Application** | React 18, TypeScript, Vite, Lucide Icons, Vanilla CSS Design System |
| **Cloud Hosting** | **Render** (Python Backend) & **Vercel** (React Frontend) |

---

## Machine Learning Pipeline & Architecture

1. **Cohort Dataset**:
   - **Pima Indians Diabetes Database** (National Institute of Diabetes and Digestive and Kidney Diseases).
   - 768 patient records with 8 physiological biomarkers (`Pregnancies`, `Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI`, `DiabetesPedigreeFunction`, `Age`).
2. **Preprocessing & Standardization**:
   - Continuous physiological features are standardized to zero-mean and unit-variance using `StandardScaler` to optimize SVM hyperplane boundary convergence.
3. **Model Selection**:
   - **Support Vector Classifier (SVC - Linear Kernel)** with cross-validated margin maximization.
   - Evaluated alongside Random Forest, Gradient Boosting, k-NN, and Logistic Regression.
4. **Model Serialization**:
   - Serialized artifacts (`model.pkl` and `scaler.pkl`) enable sub-millisecond cloud inference.
5. **Explainability**:
   - Real-time clinical risk classification (Low / Moderate / High), probability score (0-100%), and individual biomarker contribution breakdown.

---

## Project Structure

```
Diabetes Detection/
├── backend/
│   ├── app.py                 # Flask REST API (serves Colab ML model)
│   ├── model.pkl              # Trained SVM model from Colab
│   ├── scaler.pkl             # Fitted StandardScaler from Colab
│   ├── requirements.txt       # Backend Python dependencies
│   ├── Procfile               # Gunicorn process definition
│   └── .env.example
├── frontend/
│   ├── src/                   # React 18 + TypeScript source code
│   │   ├── components/        # Reusable UI components (ResultCard, Form, Navbar, Hero)
│   │   ├── pages/             # Home, Prediction, ModelInsights, History
│   │   ├── services/          # API client (fetch, types)
│   │   ├── types/             # TypeScript interfaces
│   │   └── index.css          # Curated dark-glassmorphism theme
│   ├── package.json
│   ├── vercel.json            # Vercel SPA routing rewrites
│   └── vite.config.ts
├── ml/
│   ├── data/
│   │   └── diabetes.csv       # Pima Indians Diabetes Dataset
│   ├── models/                # Benchmark models and diagnostic plots
│   ├── train.py               # ML training & benchmark pipeline
│   ├── predictor.py           # Python ML inference engine
│   └── eda.py                 # Exploratory Data Analysis
├── app.py                     # Root entrypoint for Gunicorn / Render
├── main.py                    # Root entrypoint for alternative runners
├── Procfile                   # Cloud web process definition
├── requirements.txt           # Root Python dependencies for Render
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
