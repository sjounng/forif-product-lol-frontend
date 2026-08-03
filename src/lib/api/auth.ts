import type { User, UserProfile } from "@/types";
import { apiFetch, setAccessToken } from "@/lib/api/client";

/**
 * 담당: A
 *
 * 백엔드가 이미 완성되어 있는 유일한 도메인이다. 그대로 붙이기만 하면 된다.
 *   POST   /api/auth/signup   { email, password, displayName }        → 201 UserResponse
 *   POST   /api/auth/login    { email, password }                     → AuthResponse
 *   POST   /api/auth/refresh  HttpOnly cookie                         → AuthResponse (토큰 로테이션)
 *   POST   /api/auth/logout   HttpOnly cookie                         → 204
 *   GET    /api/auth/me       Authorization: Bearer <accessToken>     → UserResponse
 *
 * 리프레시 토큰은 자바스크립트에 노출하지 않는다.
 */

export interface AuthResult {
  accessToken: string;
  expiresIn: number;
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const result = await apiFetch<AuthResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(result.accessToken);
  return result;
}

export async function signup(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  return apiFetch<User>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, displayName }),
  });
}

export async function fetchMe(): Promise<User> {
  return apiFetch<User>("/api/auth/me");
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<void>("/api/auth/logout", { method: "POST" });
  } finally {
    setAccessToken(null);
  }
}

export function fetchProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/users/me/profile");
}

export function updateProfile(displayName: string): Promise<User> {
  return apiFetch<User>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify({ displayName }),
  });
}

export function linkRiotAccount(gameName: string, tagLine: string): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/users/me/riot-account", {
    method: "PUT",
    body: JSON.stringify({ gameName, tagLine }),
  });
}
