import type { User } from "@/types";

/**
 * 담당: A
 *
 * 백엔드가 이미 완성되어 있는 유일한 도메인이다. 그대로 붙이기만 하면 된다.
 *   POST   /api/auth/signup   { email, password, displayName }        → 201 UserResponse
 *   POST   /api/auth/login    { email, password }                     → AuthResponse
 *   POST   /api/auth/refresh  { refreshToken }                        → AuthResponse (토큰 로테이션)
 *   POST   /api/auth/logout   { refreshToken }                        → 204
 *   GET    /api/auth/me       Authorization: Bearer <accessToken>     → UserResponse
 *
 * AuthResponse = { accessToken, tokenType, expiresIn, refreshToken, user }
 * 리프레시 토큰은 재발급 때마다 바뀐다(로테이션). 항상 최신 것만 보관할 것.
 */

export interface AuthResult {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  user: User;
}

// TODO(A): apiFetch 로 구현
export async function login(_email: string, _password: string): Promise<AuthResult> {
  throw new Error("미구현: POST /api/auth/login");
}

// TODO(A): apiFetch 로 구현
export async function signup(
  _email: string,
  _password: string,
  _displayName: string,
): Promise<User> {
  throw new Error("미구현: POST /api/auth/signup");
}

// TODO(A): apiFetch 로 구현
export async function fetchMe(): Promise<User> {
  throw new Error("미구현: GET /api/auth/me");
}

// TODO(A): apiFetch 로 구현
export async function logout(_refreshToken: string): Promise<void> {
  throw new Error("미구현: POST /api/auth/logout");
}
