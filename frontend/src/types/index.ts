export interface PatientInputs {
  pregnancies: number;
  glucose: number;
  blood_pressure: number;
  skin_thickness: number;
  insulin: number;
  bmi: number;
  diabetes_pedigree_function: number;
  age: number;
}

export interface PredictionBreakdown {
  glucose: number;
  bmi: number;
  age: number;
  diabetes_pedigree_function: number;
  blood_pressure: number;
  insulin: number;
  skin_thickness: number;
  pregnancies: number;
}

export type RiskLevel = 'Low' | 'Moderate' | 'High';
export type Confidence = 'Low' | 'Moderate' | 'High';

export interface ModelInfo {
  name: string;
  algorithm: string;
  accuracy: number;
  roc_auc: number;
}

export interface PredictionResult {
  _id?: string;
  id?: string;
  prediction: 0 | 1;
  result: string;
  risk_level: RiskLevel;
  confidence: Confidence;
  score: number;
  probability?: number;
  probability_non_diabetic?: number;
  breakdown: PredictionBreakdown;
  thresholds: { low: number; high: number };
  imputed_fields?: string[];
  model_info?: ModelInfo;
  createdAt?: string;
}

export interface PredictionRecord extends PredictionResult {
  _id: string;
  inputs: PatientInputs;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  data: PredictionRecord[];
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
}

export interface ConfusionMatrix {
  true_negatives: number;
  false_positives: number;
  false_negatives: number;
  true_positives: number;
  total_test_samples: number;
}

export interface RocPoint {
  fpr: number;
  tpr: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  percentage: number;
}

export interface LeaderboardModel {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  cv_roc_auc_mean: number;
  cv_roc_auc_std: number;
}

export interface DatasetInfo {
  name: string;
  total_samples: number;
  features_count: number;
  diabetic_samples: number;
  non_diabetic_samples: number;
  train_samples: number;
  test_samples: number;
}

export interface ModelMetricsResponse {
  performance: ModelPerformance;
  confusion_matrix: ConfusionMatrix;
  roc_curve: RocPoint[];
  feature_importance: FeatureImportance[];
  leaderboard: LeaderboardModel[];
  dataset: DatasetInfo;
}

export interface FieldConfig {
  name: keyof PatientInputs;
  label: string;
  unit: string;
  unitShort: string;
  placeholder: string;
  min: number;
  step: string;
  description: string;
}

export type PageId = 'home' | 'predict' | 'models' | 'history' | 'how-it-works' | 'about';
