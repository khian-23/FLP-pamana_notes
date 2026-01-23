import { getAccessToken, refreshAccessToken, logout } from "./auth";

const API_BASE = "http://127.0.0.1:8000";

export async function apiFetch(url, options = {}) {
  let token = getAccessToken();

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  // 🔥 DO NOT set Content-Type when using FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      logout();
      throw new Error("Session expired");
    }

    token = getAccessToken();
    headers.Authorization = `Bearer ${token}`;

    response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  // ✅ Handle DELETE / 204 No Content correctly
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
