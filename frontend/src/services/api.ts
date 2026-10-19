import type { PatientInputs, PredictionResult, HistoryResponse, ModelMetricsResponse, ModelInfo } from '../types';

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://diabetes-detection-model-rkzs.onrender.com'
    : 'http://127.0.0.1:5000');

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.detail) {
        message = Array.isArray(errData.detail)
          ? errData.detail.map((item: { msg: string }) => item.msg).join(', ')
          : String(errData.detail);
      }
    } catch {
      /* keep default */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function predictDiabetes(patientData: PatientInputs): Promise<PredictionResult> {
  const res = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });
  return handleResponse<PredictionResult>(res);
}

export async function fetchHistory(page = 1, limit = 10): Promise<HistoryResponse> {
  const res = await fetch(`${API_URL}/predict/history?page=${page}&limit=${limit}`);
  return handleResponse<HistoryResponse>(res);
}

export async function deleteHistoryRecord(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/predict/history/${id}`, { method: 'DELETE' });
  await handleResponse<unknown>(res);
}

export async function fetchModelMetrics(): Promise<ModelMetricsResponse> {
  const res = await fetch(`${API_URL}/model/metrics`);
  return handleResponse<ModelMetricsResponse>(res);
}

export async function fetchModelInfo(): Promise<ModelInfo> {
  const res = await fetch(`${API_URL}/model/info`);
  return handleResponse<ModelInfo>(res);
}

export async function checkHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_URL}/`);
  return handleResponse<{ status: string; service: string }>(res);
}
