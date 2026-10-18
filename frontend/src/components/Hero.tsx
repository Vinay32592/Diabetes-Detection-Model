import { ArrowRight, ShieldCheck, Cpu, BarChart2 } from 'lucide-react'
import type { PageId } from '../types'

interface HeroProps {
  onNavigate: (page: PageId) => void
}

function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-grid-pattern" />
      </div>

      <div className="container hero-grid">
        <div className="hero-content animate-rise">
          <p className="eyebrow">
            <Cpu size={14} aria-hidden="true" />
            Machine Learning • Clinical Predictive Analytics
          </p>
          <h1>
            AI-Driven
            <span className="text-gradient"> Diabetes Detection</span>
          </h1>
          <p className="hero-subtitle">
            An advanced machine learning platform powered by Scikit-Learn and FastAPI that analyzes 8 clinical biomarkers to deliver calibrated risk probabilities and explainable diagnostic insights.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary btn-glow" onClick={() => onNavigate('predict')}>
              Start ML Prediction
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate('models')}
            >
              <BarChart2 size={16} />
              Model Insights & Metrics
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <strong>86.4%</strong>
              <span>Test Accuracy</span>
            </div>
            <div className="stat-item">
              <strong>0.950</strong>
              <span>ROC - AUC Score</span>
            </div>
            <div className="stat-item">
              <strong>150</strong>
              <span>Ensemble Trees</span>
            </div>
            <div className="stat-item">
              <strong>8</strong>
              <span>Biomarkers</span>
            </div>
          </div>
        </div>

        <div className="hero-card animate-rise delay-1">
          <div className="hero-card-icon">
            <ShieldCheck size={28} aria-hidden="true" />
          </div>
          <h2>Trained Machine Learning Model</h2>
          <p>
            Trained and cross-validated on the authentic Pima Indians Diabetes Database using hyperparameter-optimized Random Forest and Gradient Boosting algorithms.
          </p>
          <ul className="hero-checklist">
            <li>5-Fold Stratified Cross-Validation</li>
            <li>Median missing lab value imputation</li>
            <li>Feature importance & contribution breakdown</li>
            <li>Persistent prediction history & audit log</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Hero
