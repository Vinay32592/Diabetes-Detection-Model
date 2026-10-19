import { useState } from 'react'
import Navbar from './components/Navbar.tsx'
import Home from './pages/Home.tsx'
import Prediction from './pages/Prediction.tsx'
import ModelInsights from './pages/ModelInsights.tsx'
import History from './pages/History.tsx'
import Footer from './components/Footer.tsx'
import type { PageId } from './types'

function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home')

  const navigate = (page: PageId) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app">
      <Navbar currentPage={currentPage} onNavigate={navigate} />
      <main>
        {currentPage === 'home' && <Home onNavigate={navigate} />}
        {currentPage === 'predict' && <Prediction />}
        {currentPage === 'models' && <ModelInsights />}
        {currentPage === 'history' && <History />}
        {currentPage === 'how-it-works' && (
          <section className="page-section">
            <div className="container">
              <h1>How Machine Learning Prediction Works</h1>
              <p className="section-subtitle">
                A modern data science architecture built with Scikit-Learn and Flask for accurate clinical risk estimation.
              </p>
              <div className="steps-grid">
                <article className="step-card">
                  <span className="step-number">1</span>
                  <h3>Clinical Input & Imputation</h3>
                  <p>Input patient health indicators. Biologically impossible zeros in lab values (e.g., Insulin, SkinThickness) are handled via statistical median imputation.</p>
                </article>
                <article className="step-card">
                  <span className="step-number">2</span>
                  <h3>Standard Feature Scaling</h3>
                  <p>Features are transformed into standard z-score distributions using a pre-fitted StandardScaler trained on the 768-sample Pima cohort.</p>
                </article>
                <article className="step-card">
                  <span className="step-number">3</span>
                  <h3>Support Vector Classifier (SVM)</h3>
                  <p>A Support Vector Classifier with linear kernel computes optimal hyperplane margins to generate calibrated risk probabilities.</p>
                </article>
                <article className="step-card">
                  <span className="step-number">4</span>
                  <h3>Feature Importance & Tracking</h3>
                  <p>Predictions are logged with individual biomarker contributions, risk classifications, and historical audit logs.</p>
                </article>
              </div>
            </div>
          </section>
        )}
        {currentPage === 'about' && (
          <section className="page-section">
            <div className="container narrow">
              <h1>About This Machine Learning Project</h1>
              <p>
                This project is an end-to-end Machine Learning web application designed for early diabetes detection.
                It replaces heuristic guesswork with statistical machine learning models trained on the benchmark Pima Indians Diabetes Database from the National Institute of Diabetes and Digestive and Kidney Diseases.
              </p>
              <p>
                The production architecture decouples model training, preprocessing with StandardScaler, high-performance REST API inference on Render, and an interactive React dashboard on Vercel.
              </p>
              
              <h2>Technology Stack</h2>
              <div className="tech-stack">
                <span>Python 3.13</span>
                <span>Scikit-Learn (SVC)</span>
                <span>Flask</span>
                <span>Gunicorn</span>
                <span>Pandas</span>
                <span>NumPy</span>
                <span>React 18</span>
                <span>TypeScript</span>
                <span>Vite</span>
                <span>Render</span>
                <span>Vercel</span>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
