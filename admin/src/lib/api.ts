const BASE = '/administrador/api';

export interface LogEntry {
  id: number;
  action: string;
  entity: string;
  entity_id: number | null;
  description: string;
  user_id: number;
  user_email: string;
  created_at: string;
}

export async function api<T>(path: string, options?: RequestInit): Promise<{ success: boolean; data?: T; message?: string; log?: LogEntry }> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const result = await res.json();
  if (result.log) {
    window.dispatchEvent(new CustomEvent("admin:log", { detail: result.log }));
  }
  return result;
}

export async function apiGet<T>(path: string) {
  const result = await api<T>(path);
  if (!result.success) throw new Error(result.message || 'Error de conexión');
  return result.data as T;
}

export async function apiPut<T>(path: string, body: unknown) {
  const result = await api<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  return result;
}

export async function apiPost<T>(path: string, body: unknown) {
  const result = await api<T>(path, { method: 'POST', body: JSON.stringify(body) });
  return result;
}

export async function apiDelete<T>(path: string) {
  const result = await api<T>(path, { method: 'DELETE' });
  return result;
}

export async function apiUpload(path: string, formData: FormData) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    method: 'POST',
    body: formData,
  });
  return res.json();
}
