const BASE = '/administrador/api';

export async function api<T>(path: string, options?: RequestInit): Promise<{ success: boolean; data?: T; message?: string }> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  return res.json();
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
