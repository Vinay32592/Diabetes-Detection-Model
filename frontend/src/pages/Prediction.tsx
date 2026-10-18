import { useState } from 'react'
import PredictionForm from '../components/PredictionForm.tsx'
import ResultCard from '../components/ResultCard.tsx'
import LoadingState from '../components/LoadingState.tsx'
import FeatureInfo from '../components/FeatureInfo.tsx'
import { predictDiabetes } from '../services/api.ts'
import type { PatientInputs, PredictionResult } from '../types'

function Prediction() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastInputs, setLastInputs] = useState<PatientInputs | null>(null)

  async function handleSubmit(patientData: PatientInputs) {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await predictDiabetes(patientData)
      setResult(response)
      setLastInputs(patientData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(
        message === 'Failed to fetch'
          ? 'Unable to reach the server. Make sure the API backend is running.'
          : message,
      )
      setLastInputs(null)
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setError(null)
    setLastInputs(null)
  }

  return (
    <>
      <section className="page-section prediction-page">
        <div className="container">
          <div className="page-header">
            <h1>Machine Learning Diabetes Risk Assessment</h1>
            <p>Enter patient physiological indicators below to receive real-time inference and calibrated risk classification from our trained Random Forest model.</p>
          </div>

          <div className="prediction-layout">
            <div className="prediction-panel">
              <h2>Patient Metrics</h2>
              <PredictionForm onSubmit={handleSubmit} onReset={handleReset} loading={loading} />
            </div>

            <div className="prediction-panel">
              <h2>Assessment Result</h2>
              {loading ? (
                <LoadingState />
              ) : (
                <ResultCard result={result} error={error} inputs={lastInputs} />
              )}
            </div>
          </div>
        </div>
      </section>

      <FeatureInfo />
    </>
  )
}

export default Prediction
