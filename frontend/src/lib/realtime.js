import { getToken } from "./api";

export const REALTIME_WINDOW_EVENT = "realtime:event";

function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
}

function normalizeHttpBaseUrl(url) {
  return url.replace(/\/api\/?$/, "");
}

export function getRealtimeUrl() {
  const token = getToken();

  if (!token) {
    return null;
  }

  const configuredUrl = import.meta.env.VITE_WS_URL;
  const baseUrl = configuredUrl || normalizeHttpBaseUrl(getApiBaseUrl());
  const realtimeUrl = new URL("/ws", `${baseUrl.replace(/\/$/, "")}/`);

  realtimeUrl.protocol = realtimeUrl.protocol === "https:" ? "wss:" : "ws:";
  realtimeUrl.searchParams.set("token", token);

  return realtimeUrl.toString();
}

export function dispatchRealtimeEvent(detail) {
  window.dispatchEvent(new CustomEvent(REALTIME_WINDOW_EVENT, { detail }));

  if (String(detail?.type || "").startsWith("notification.")) {
    window.dispatchEvent(new Event("notifications-updated"));
  }
}

export function restoreSpaLocationFromRedirect() {
  const currentUrl = new URL(window.location.href);
  const redirectPath = currentUrl.searchParams.get("redirect");

  if (!redirectPath) {
    return;
  }

  currentUrl.searchParams.delete("redirect");
  const cleanSearch = currentUrl.searchParams.toString();
  const nextPath = `${redirectPath}${cleanSearch ? `${redirectPath.includes("?") ? "&" : "?"}${cleanSearch}` : ""}`;
  window.history.replaceState(null, "", nextPath);
}
