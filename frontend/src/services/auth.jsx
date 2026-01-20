import { jwtDecode } from "jwt-decode";
const API_BASE = "http://127.0.0.1:8000";

export function getAccessToken() {
  return localStorage.getItem("access");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh");
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

export async function login(school_id, password) {
  const res = await fetch(`${API_BASE}/accounts/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ school_id, password }),
  });

  if (!res.ok) throw new Error("Invalid credentials");

  const data = await res.json();
  setTokens(data);
}

export function isAuthenticated() {
  const token = getAccessToken();
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    return Date.now() < exp * 1000;
  } catch {
    return false;
  }
}

export function isAdmin() {
  const token = getAccessToken();
  if (!token) return false;

  try {
    return Boolean(jwtDecode(token)?.is_staff);
  } catch {
    return false;
  }
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  const response = await fetch(
    `${API_BASE}/accounts/api/auth/token/refresh/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }
  );

  if (!response.ok) {
    logout();
    return false;
  }

  const data = await response.json();
  localStorage.setItem("access", data.access);
  return true;
}

