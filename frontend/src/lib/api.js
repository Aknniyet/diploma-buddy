const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("buddyconnect_token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "Request failed.");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function saveAuth(token, user) {
  localStorage.setItem("buddyconnect_token", token);
  localStorage.setItem("buddyconnect_user", JSON.stringify(user));
}

export function getSavedUser() {
  const raw = localStorage.getItem("buddyconnect_user");
  return raw ? JSON.parse(raw) : null;
}

export function getToken() {
  return localStorage.getItem("buddyconnect_token");
}

export function clearAuth() {
  localStorage.removeItem("buddyconnect_token");
  localStorage.removeItem("buddyconnect_user");
}
