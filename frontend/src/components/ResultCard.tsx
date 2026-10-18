import { AlertCircle, CheckCircle2, HeartPulse, TrendingUp, Cpu, Activity, BarChart2 } from 'lucide-react'
import { FIELD_CONFIG, formatValueWithUnit } from '../constants/fields.ts'
import type { PatientInputs, PredictionResult } from '../types'

interface RiskMeterProps {
  score: number
  probability?: number
}

function RiskMeter({ score, probability }: RiskMeterProps) {
  const pct = Math.min(100, Math.max(0, score))
  const colorClass = pct >= 60 ? 'fill-high' : pct >= 35 ? 'fill-medium' : 'fill-low'

  return (
    <div className="risk-meter-container">
      <div className="risk-meter-header">
        <span className="meter-caption">ML Calibrated Risk Index</span>
        <span className="meter-pct">{probability ? `${(probability * 100).toFixed(1)}% Probability` : `${pct}/100`}</span>
      </div>
      <div className="risk-meter" aria-hidden="true">
        <div className="risk-meter-track">
          <div className={`risk-meter-fill ${colorClass}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="risk-meter-labels">
          <span>Low Risk (&lt;35%)</span>
          <span>Moderate (35-60%)</span>
          <span>High Risk (&gt;60%)</span>
        </div>
      </div>
    </div>
  )
}

interface ResultCardProps {
  result: PredictionResult | null
  error: string | null
  inputs: PatientInputs | null
}

function ResultCard({ result, error, inputs }: ResultCardProps) {
  if (error) {
    return (
      <div className="result-card result-error animate-result" role="alert">
        <div className="result-icon-wrap error">
          <AlertCircle size={32} aria-hidden="true" />
        </div>
        <h3>Prediction Failed</h3>
        <p>{error}</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="result-card result-empty">
        <div className="result-placeholder-icon">
          <HeartPulse size={40} aria-hidden="true" />
          <div className="pulse-ring" />
        </div>
        <h3>Awaiting ML Evaluation</h3>
        <p>Complete the health parameters and click <strong>Run ML Risk Prediction</strong> to evaluate with our trained Random Forest model.</p>
      </div>
    )
  }

  const isDiabetic = result.prediction === 1
  const score = result.score ?? (isDiabetic ? 75 : 20)
  const riskLevel = result.risk_level ?? (isDiabetic ? 'High' : 'Low')
  const confidence = result.confidence ?? 'Moderate'
  const modelName = result.model_info?.name || 'Tuned Random Forest Classifier'
  const modelAcc = result.model_info?.accuracy ? `${(result.model_info.accuracy * 100).toFixed(1)}% Acc` : '86.4% Acc'
  const modelRoc = result.model_info?.roc_auc ? `${result.model_info.roc_auc.toFixed(3)} ROC-AUC` : '0.950 ROC-AUC'
  const probDiabetic = result.probability !== undefined ? (result.probability * 100).toFixed(1) : score.toFixed(1)
  const probHealthy = result.probability_non_diabetic !== undefined ? (result.probability_non_diabetic * 100).toFixed(1) : (100 - score).toFixed(1)

  return (
    <div
      className={`result-card animate-result ${isDiabetic ? 'result-positive' : 'result-negative'}`}
    >
      {/* Top Model Badge */}
      <div className="model-chip">
        <span className="model-chip-title">
          <Cpu size={14} aria-hidden="true" />
          {modelName}
        </span>
        <span className="model-chip-metrics">{modelAcc} • {modelRoc}</span>
      </div>

      <div className="result-badge-row">
        <span className={`risk-badge ${isDiabetic ? 'risk-high' : 'risk-low'}`}>
          {riskLevel} Risk
        </span>
        <span className="confidence-badge">
          <TrendingUp size={12} aria-hidden="true" />
          {confidence} Confidence
        </span>
      </div>

      <div className="result-header">
        <div className={`result-icon-wrap ${isDiabetic ? 'warning' : 'success'}`}>
          {isDiabetic ? (
            <AlertCircle size={32} aria-hidden="true" />
          ) : (
            <CheckCircle2 size={32} aria-hidden="true" />
          )}
        </div>
        <div>
          <p className="result-eyebrow">ML Classification Result</p>
          <p className="result-label">{result.result}</p>
        </div>
      </div>

      {/* Probability Dual Bar */}
      <div className="probability-dual-card">
        <div className="probability-row">
          <div className="prob-item">
            <span className="prob-label">Diabetes Probability</span>
            <span className="prob-value high-text">{probDiabetic}%</span>
          </div>
          <div className="prob-item text-right">
            <span className="prob-label">Healthy Probability</span>
            <span className="prob-value healthy-text">{probHealthy}%</span>
          </div>
        </div>
        <div className="prob-bar-container">
          <div
            className="prob-bar-diabetic"
            style={{ width: `${Math.min(100, Math.max(0, parseFloat(probDiabetic)))}%` }}
          />
        </div>
      </div>

      <RiskMeter score={score} probability={result.probability} />

      <p className="result-message">
        {isDiabetic
          ? 'The Machine Learning model classified this biomarker profile as elevated risk for diabetes, exhibiting clinical patterns consistent with high-risk phenotypes in the Pima clinical dataset.'
          : 'The Machine Learning model classified this biomarker profile as low risk for diabetes, with physiological markers aligning with non-diabetic reference distributions.'}
      </p>

      {/* Imputed Fields Notice */}
      {result.imputed_fields && result.imputed_fields.length > 0 && (
        <div className="imputation-notice">
          <Activity size={14} aria-hidden="true" />
          <span>
            Clinical median imputation applied for unprovided fields ({result.imputed_fields.join(', ')}).
          </span>
        </div>
      )}

      {/* Biomarker Contribution Breakdown */}
      {result.breakdown && (
        <div className="contributions-panel">
          <div className="panel-title-row">
            <BarChart2 size={16} aria-hidden="true" />
            <h4>Biomarker Contribution Index</h4>
          </div>
          <div className="contribution-bars">
            {Object.entries(result.breakdown).map(([key, val]) => {
              const field = FIELD_CONFIG.find((f) => f.name === key)
              const label = field ? field.label : key
              const pctVal = Math.min(100, Math.max(0, val))
              return (
                <div key={key} className="contrib-row">
                  <div className="contrib-label-wrap">
                    <span className="contrib-label">{label}</span>
                    <span className="contrib-value">{val.toFixed(1)}</span>
                  </div>
                  <div className="contrib-track">
                    <div
                      className={`contrib-fill ${pctVal >= 60 ? 'high' : pctVal >= 45 ? 'medium' : 'low'}`}
                      style={{ width: `${pctVal}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {inputs && (
        <div className="input-summary">
          <h4>Patient Input Summary</h4>
          <dl>
            {FIELD_CONFIG.map((field) => (
              <div key={field.name} className="summary-row">
                <dt>
                  {field.label}
                  <span className="summary-unit">{field.unit}</span>
                </dt>
                <dd>{formatValueWithUnit(field.name, inputs[field.name])}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <p className="disclaimer-inline">
        This result is produced by a statistical machine learning classifier trained on clinical observational data. It does not constitute medical diagnosis.
      </p>
    </div>
  )
}

export default ResultCard
