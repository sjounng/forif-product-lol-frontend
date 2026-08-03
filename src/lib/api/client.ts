/**
 * 백엔드 호출 공통 래퍼.
 *
 * 액세스 토큰은 메모리에만 보관하고, HttpOnly 리프레시 쿠키로 복구한다.
 */

import type { User } from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let accessToken: string | null = null;
const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";
let sessionExpiryNotified = false;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) sessionExpiryNotified = false;
}

export function getAccessToken() {
  return accessToken;
}

export function subscribeToSessionExpiry(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);
  return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);
}

function notifySessionExpiry() {
  if (typeof window === "undefined" || sessionExpiryNotified) return;
  sessionExpiryNotified = true;
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

interface RefreshPayload {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: User;
}

let refreshPromise: Promise<User | null> | null = null;

export function refreshSession(): Promise<User | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })
    .then(async (response) => {
      if (!response.ok) {
        setAccessToken(null);
        return null;
      }
      const body = (await response.json()) as RefreshPayload;
      setAccessToken(body.accessToken);
      return body.user;
    })
    .catch(() => {
      setAccessToken(null);
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  return request<T>(path, init, true);
}

async function request<T>(
  path: string,
  init: RequestInit,
  allowRefresh: boolean,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (
    response.status === 401 &&
    allowRefresh &&
    !path.startsWith("/api/auth/")
  ) {
    const user = await refreshSession();
    if (user) return request<T>(path, init, false);
    notifySessionExpiry();
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      code?: string;
      message?: string;
    } | null;
    throw new ApiError(
      response.status,
      body?.code ?? "UNKNOWN_ERROR",
      body?.message ?? "요청을 처리하지 못했습니다.",
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
