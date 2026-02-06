import { jwtDecode } from "jwt-decode";
import { API_BASE } from "./api";

/* =====================
   TOKENS
===================== */
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

/* =====================
   AUTH
===================== */
export async function login(school_id, password) {
  const res = await fetch(`${API_BASE}/accounts/api/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ school_id, password }),
  });

  if (!res.ok) throw new Error("Invalid credentials");

  const data = await res.json();
  setTokens(data);

  return data;
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

/* =====================
   ROLE HELPERS
===================== */
export function getUserRole() {
  const token = getAccessToken();
  if (!token) return null;

  try {
    return jwtDecode(token)?.role || null;
  } catch {
    return null;
  }
}

export function getUserCourse() {
  const token = getAccessToken();
  if (!token) return null;

  try {
    return jwtDecode(token)?.course || null;
  } catch {
    return null;
  }
}

// 🔒 LEGACY
export function isAdmin() {
  const role = getUserRole();
  return role === "admin";
}

/* =====================
   TOKEN REFRESH
===================== */
export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  const res = await fetch(`${API_BASE}/accounts/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    logout();
    return false;
  }

  const data = await res.json();
  localStorage.setItem("access", data.access);
  return true;
}
