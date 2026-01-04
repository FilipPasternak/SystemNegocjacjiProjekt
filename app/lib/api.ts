export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> || {}),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers, cache: "no-store" });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    if (res.status === 401) {
      message = "Musisz być zalogowany, aby wykonać tę akcję.";
    }
    if (res.status === 403) {
      message = "Brak uprawnień do wykonania tej akcji.";
    }
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") {
        message = data.detail;
      } else if (typeof data?.message === "string") {
        message = data.message;
      }
    } catch (_) {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  return res.json();
}

export const AUTH_CHANGE_EVENT = "auth-changed";

export function saveAuth(token: string, user: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", token);
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getUser(): { id: number; email: string; role: "PRODUCER" | "BUYER" } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Cannot parse stored user", e);
    return null;
  }
}
