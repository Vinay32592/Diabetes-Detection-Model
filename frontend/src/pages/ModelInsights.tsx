import { useState, useEffect } from 'react'
import {
  Cpu,
  Award,
  BarChart3,
  GitCompare,
  Layers,
  Database,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react'
import { fetchModelMetrics, API_URL } from '../services/api'
import type { ModelMetricsResponse } from '../types'

function ModelInsights() {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'matrix' | 'features' | 'roc' | 'plots'>('benchmarks')

  const loadMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchModelMetrics()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model metrics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetrics()
  }, [])

  return (
    <section className="page-section model-insights-page">
      <div className="container">
        {/* Header */}
        <div className="insights-header">
          <div className="header-badge">
            <Cpu size={16} aria-hidden="true" />
            <span>Machine Learning Intelligence & Model Performance</span>
          </div>
          <h1>Model Architecture & Evaluation Benchmarks</h1>
          <p className="subtitle">
            Comprehensive evaluation metrics, cross-validation leaderboards, feature importance rankings, and ROC curves trained on the Pima Indians Diabetes Database.
          </p>
        </div>

        {loading && (
          <div className="loading-card">
            <RefreshCw className="spin-icon" size={28} />
            <p>Loading Machine Learning diagnostic data from API...</p>
          </div>
        )}

        {error && (
          <div className="error-card">
            <p className="error-title">Unable to connect to ML Model API</p>
            <p className="error-desc">{error}</p>
            <button className="btn btn-secondary" onClick={loadMetrics}>
              <RefreshCw size={14} /> Retry Connection
            </button>
          </div>
        )}

        {metrics && !loading && (
          <>
            {/* Top Stat Cards */}
            <div className="metrics-kpi-grid">
              <div className="kpi-card highlight-kpi">
                <div className="kpi-icon-wrap">
                  <Award size={24} />
                </div>
                <div>
                  <span className="kpi-label">Primary ML Model</span>
                  <h3 className="kpi-value">Random Forest</h3>
                  <span className="kpi-sub">Hyperparameter Tuned Ensemble</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <span className="kpi-label">Test Set Accuracy</span>
                  <h3 className="kpi-value">{(metrics.performance.accuracy * 100).toFixed(1)}%</h3>
                  <span className="kpi-sub">Stratified 80/20 Holdout</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap">
                  <GitCompare size={24} />
                </div>
                <div>
                  <span className="kpi-label">ROC - AUC Score</span>
                  <h3 className="kpi-value">{metrics.performance.roc_auc.toFixed(3)}</h3>
                  <span className="kpi-sub">Area Under ROC Curve</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon-wrap">
                  <Database size={24} />
                </div>
                <div>
                  <span className="kpi-label">Dataset Records</span>
                  <h3 className="kpi-value">{metrics.dataset.total_samples}</h3>
                  <span className="kpi-sub">{metrics.dataset.features_count} Clinical Biomarkers</span>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="insights-tabs">
              <button
                className={`tab-btn ${activeTab === 'benchmarks' ? 'active' : ''}`}
                onClick={() => setActiveTab('benchmarks')}
              >
                <GitCompare size={16} /> Algorithm Leaderboard
              </button>
              <button
                className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                <BarChart3 size={16} /> Feature Importance
              </button>
              <button
                className={`tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
                onClick={() => setActiveTab('matrix')}
              >
                <Layers size={16} /> Confusion Matrix
              </button>
              <button
                className={`tab-btn ${activeTab === 'roc' ? 'active' : ''}`}
                onClick={() => setActiveTab('roc')}
              >
                <Award size={16} /> ROC-AUC Curve
              </button>
              <button
                className={`tab-btn ${activeTab === 'plots' ? 'active' : ''}`}
                onClick={() => setActiveTab('plots')}
              >
                <ExternalLink size={16} /> Diagnostic Plots
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-pane-card">
              {/* Tab 1: Benchmarks */}
              {activeTab === 'benchmarks' && (
                <div className="tab-section">
                  <div className="tab-section-header">
                    <h2>Cross-Validation Algorithm Leaderboard</h2>
                    <p>
                      We benchmarked 5 distinct machine learning classifiers on the preprocessed Pima dataset using 5-fold stratified cross-validation.
                    </p>
                  </div>

                  <div className="table-responsive">
                    <table className="leaderboard-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Model Algorithm</th>
                          <th>Accuracy</th>
                          <th>Precision</th>
                          <th>Recall (Sensitivity)</th>
                          <th>F1-Score</th>
                          <th>Test ROC-AUC</th>
                          <th>5-Fold CV ROC-AUC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.leaderboard.map((m, idx) => (
                          <tr key={m.model_name} className={idx === 0 ? 'top-row' : ''}>
                            <td>
                              <span className={`rank-badge ${idx === 0 ? 'rank-1' : ''}`}>#{idx + 1}</span>
                            </td>
                            <td>
                              <strong>{m.model_name}</strong>
                              {idx === 0 && <span className="winner-tag">Active Model</span>}
                            </td>
                            <td>{(m.accuracy * 100).toFixed(1)}%</td>
                            <td>{(m.precision * 100).toFixed(1)}%</td>
                            <td>{(m.recall * 100).toFixed(1)}%</td>
                            <td>{(m.f1_score * 100).toFixed(1)}%</td>
                            <td>
                              <span className="auc-highlight">{m.roc_auc.toFixed(3)}</span>
                            </td>
                            <td>
                              {m.cv_roc_auc_mean.toFixed(3)} <small className="text-muted">± {m.cv_roc_auc_std.toFixed(3)}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="insights-callout">
                    <Info size={18} />
                    <div>
                      <strong>Why Random Forest & Gradient Boosting?</strong> Ensemble tree methods effectively capture nonlinear interactions between physiological biomarkers (e.g. Glucose vs Insulin and Age vs BMI) while resisting overfitting through bootstrap aggregation and feature subspace sampling.
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Feature Importance */}
              {activeTab === 'features' && (
                <div className="tab-section">
                  <div className="tab-section-header">
                    <h2>Biomarker Feature Importance Rankings</h2>
                    <p>
                      Relative Gini importance calculated across all decision trees in the ensemble.
                    </p>
                  </div>

                  <div className="feature-bars-grid">
                    {metrics.feature_importance.map((f, i) => (
                      <div key={f.feature} className="feature-item-card">
                        <div className="feature-title-row">
                          <span className="feature-rank">#{i + 1}</span>
                          <span className="feature-name">{f.feature}</span>
                          <span className="feature-pct">{f.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="feature-track">
                          <div
                            className="feature-fill"
                            style={{
                              width: `${Math.min(100, (f.percentage / 45) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="clinical-notes-grid">
                    <div className="note-card">
                      <h4>Insulin & Glucose Predominance</h4>
                      <p>
                        Together, Serum Insulin and Plasma Glucose represent over 55% of the predictive weight, confirming that endocrine dysregulation is the primary predictor of diabetic progression.
                      </p>
                    </div>
                    <div className="note-card">
                      <h4>Adiposity Markers (BMI & SkinThickness)</h4>
                      <p>
                        Triceps skin fold and Body Mass Index provide critical body-composition context, separating insulin resistance caused by metabolic syndrome from other etiologies.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Confusion Matrix */}
              {activeTab === 'matrix' && (
                <div className="tab-section">
                  <div className="tab-section-header">
                    <h2>Confusion Matrix on Test Dataset (n = {metrics.confusion_matrix.total_test_samples})</h2>
                    <p>Evaluation results on unseen holdout test samples.</p>
                  </div>

                  <div className="cm-layout">
                    <div className="cm-grid">
                      <div className="cm-cell cm-tn">
                        <span className="cm-tag">True Negative (TN)</span>
                        <span className="cm-num">{metrics.confusion_matrix.true_negatives}</span>
                        <span className="cm-desc">Correctly classified healthy</span>
                      </div>
                      <div className="cm-cell cm-fp">
                        <span className="cm-tag">False Positive (FP)</span>
                        <span className="cm-num">{metrics.confusion_matrix.false_positives}</span>
                        <span className="cm-desc">Type I error (False alarm)</span>
                      </div>
                      <div className="cm-cell cm-fn">
                        <span className="cm-tag">False Negative (FN)</span>
                        <span className="cm-num">{metrics.confusion_matrix.false_negatives}</span>
                        <span className="cm-desc">Type II error (Missed cases)</span>
                      </div>
                      <div className="cm-cell cm-tp">
                        <span className="cm-tag">True Positive (TP)</span>
                        <span className="cm-num">{metrics.confusion_matrix.true_positives}</span>
                        <span className="cm-desc">Correctly identified diabetic</span>
                      </div>
                    </div>

                    <div className="cm-derived-stats">
                      <h3>Derived Clinical Metrics</h3>
                      <div className="stat-row">
                        <span>Sensitivity / Recall:</span>
                        <strong>
                          {((metrics.confusion_matrix.true_positives / (metrics.confusion_matrix.true_positives + metrics.confusion_matrix.false_negatives)) * 100).toFixed(1)}%
                        </strong>
                      </div>
                      <div className="stat-row">
                        <span>Specificity (TNR):</span>
                        <strong>
                          {((metrics.confusion_matrix.true_negatives / (metrics.confusion_matrix.true_negatives + metrics.confusion_matrix.false_positives)) * 100).toFixed(1)}%
                        </strong>
                      </div>
                      <div className="stat-row">
                        <span>Precision (PPV):</span>
                        <strong>
                          {((metrics.confusion_matrix.true_positives / (metrics.confusion_matrix.true_positives + metrics.confusion_matrix.false_positives)) * 100).toFixed(1)}%
                        </strong>
                      </div>
                      <div className="stat-row">
                        <span>Overall Accuracy:</span>
                        <strong>{(metrics.performance.accuracy * 100).toFixed(1)}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: ROC Curve */}
              {activeTab === 'roc' && (
                <div className="tab-section">
                  <div className="tab-section-header">
                    <h2>Receiver Operating Characteristic (ROC Curve)</h2>
                    <p>
                      Illustrates the diagnostic discrimination ability across all classification thresholds (AUC = {metrics.performance.roc_auc.toFixed(3)}).
                    </p>
                  </div>

                  <div className="roc-chart-wrapper">
                    <svg viewBox="0 0 500 350" className="roc-svg" aria-label="ROC Curve Chart">
                      {/* Grid lines */}
                      <line x1="60" y1="20" x2="60" y2="280" stroke="#334155" strokeWidth="1" />
                      <line x1="60" y1="280" x2="460" y2="280" stroke="#334155" strokeWidth="1" />
                      <line x1="60" y1="150" x2="460" y2="150" stroke="#1e293b" strokeDasharray="4" strokeWidth="1" />
                      <line x1="260" y1="20" x2="260" y2="280" stroke="#1e293b" strokeDasharray="4" strokeWidth="1" />

                      {/* Diagonal chance line */}
                      <line x1="60" y1="280" x2="460" y2="20" stroke="#64748b" strokeDasharray="6" strokeWidth="1.5" />

                      {/* ROC Curve Path */}
                      <path
                        d={metrics.roc_curve
                          .map((pt, idx) => {
                            const x = 60 + pt.fpr * 400
                            const y = 280 - pt.tpr * 260
                            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                          })
                          .join(' ')}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="3.5"
                      />

                      {/* Area Under Curve */}
                      <path
                        d={`${metrics.roc_curve
                          .map((pt, idx) => {
                            const x = 60 + pt.fpr * 400
                            const y = 280 - pt.tpr * 260
                            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                          })
                          .join(' ')} L 460 280 L 60 280 Z`}
                        fill="rgba(6, 182, 212, 0.12)"
                      />

                      {/* Labels */}
                      <text x="260" y="325" textAnchor="middle" fill="#94a3b8" fontSize="12">
                        False Positive Rate (1 - Specificity)
                      </text>
                      <text x="20" y="150" textAnchor="middle" fill="#94a3b8" fontSize="12" transform="rotate(-90 20 150)">
                        True Positive Rate (Sensitivity)
                      </text>
                      <text x="350" y="240" fill="#06b6d4" fontSize="14" fontWeight="600">
                        ROC-AUC: {metrics.performance.roc_auc.toFixed(3)}
                      </text>
                      <text x="280" y="190" fill="#64748b" fontSize="11">
                        Chance Line (AUC = 0.50)
                      </text>
                    </svg>
                  </div>
                </div>
              )}

              {/* Tab 5: Diagnostic Plots */}
              {activeTab === 'plots' && (
                <div className="tab-section">
                  <div className="tab-section-header">
                    <h2>Server Diagnostic Plots</h2>
                    <p>High-resolution visualization artifacts generated by Python matplotlib & seaborn during model training.</p>
                  </div>

                  <div className="plots-grid">
                    <div className="plot-card">
                      <h3>Feature Importance Distribution</h3>
                      <img
                        src={`${API_URL}/model/plots/feature_importance.png`}
                        alt="Feature Importance Plot"
                        className="diagnostic-img"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="plot-card">
                      <h3>Confusion Matrix Heatmap</h3>
                      <img
                        src={`${API_URL}/model/plots/confusion_matrix.png`}
                        alt="Confusion Matrix Heatmap"
                        className="diagnostic-img"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="plot-card">
                      <h3>Algorithm Benchmark Comparison</h3>
                      <img
                        src={`${API_URL}/model/plots/model_comparison.png`}
                        alt="Model Comparison Benchmark"
                        className="diagnostic-img"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default ModelInsights
