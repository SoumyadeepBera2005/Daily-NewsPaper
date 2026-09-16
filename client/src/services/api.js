const VITE_API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = `${VITE_API_URL}/api`;

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('dnh_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData body
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('dnh_token');
    }
    throw new Error(data.error || 'An error occurred while communicating with server');
  }

  return data;
}
