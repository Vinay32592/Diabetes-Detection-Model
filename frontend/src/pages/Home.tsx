import Hero from '../components/Hero.tsx'
import FeatureInfo from '../components/FeatureInfo.tsx'
import type { PageId } from '../types'

interface HomeProps {
  onNavigate: (page: PageId) => void
}

function Home({ onNavigate }: HomeProps) {
  return (
    <>
      <Hero onNavigate={onNavigate} />

      <section className="how-preview">
        <div className="container">
          <h2>Machine Learning Pipeline Workflow</h2>
          <div className="steps-grid">
            <article className="step-card">
              <span className="step-number">1</span>
              <h3>Input Patient Metrics</h3>
              <p>Enter 8 vital biomarkers. Zero-values for missing lab measurements are automatically imputed using median clinical statistics.</p>
            </article>
            <article className="step-card">
              <span className="step-number">2</span>
              <h3>StandardScaler Normalization</h3>
              <p>Inputs are standardized into z-score distribution space based on the training cohort statistics.</p>
            </article>
            <article className="step-card">
              <span className="step-number">3</span>
              <h3>SVM Hyperplane Evaluation</h3>
              <p>Our trained Support Vector Machine evaluates the optimal margin decision boundary to output a calibrated risk probability.</p>
            </article>
            <article className="step-card">
              <span className="step-number">4</span>
              <h3>Biomarker Contributions</h3>
              <p>Inspect feature contributions, compare against 5 algorithm benchmarks, and preserve audit records.</p>
            </article>
          </div>
        </div>
      </section>

      <FeatureInfo />

      <section className="disclaimer-section">
        <div className="container narrow">
          <h2>Clinical & Medical Disclaimer</h2>
          <p>
            This application is designed as an informational health screening and data science research tool. It uses supervised machine learning models trained on retrospective observational data and is not intended to provide definitive medical diagnoses or replace clinical examinations. If you have concerns about your metabolic health, please consult a licensed medical provider.
          </p>
        </div>
      </section>
    </>
  )
}

export default Home
