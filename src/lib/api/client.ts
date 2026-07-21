/**
 * 백엔드 호출 공통 래퍼.
 *
 * 지금은 아무도 이 파일을 부르지 않는다 — 모든 화면이 `lib/mock` 을 쓰는 목업 상태다.
 * 각 도메인 API 파일(auth.ts, rooms.ts ...)을 구현할 때 이걸 통해서만 호출할 것.
 *
 * TODO(공통): 먼저 붙는 사람이 아래 3개를 완성한다. 그 전까지 다른 API 파일은 못 붙는다.
 *   1. 액세스 토큰 저장소 — 메모리 + refresh 재발급. localStorage 직접 접근 금지(XSS)
 *   2. 401 응답 시 POST /api/auth/refresh 후 원요청 1회 재시도, 실패하면 /login 으로
 *   3. 백엔드 에러 바디 { status, message } 를 ApiError 로 변환
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  // TODO(공통): 401 이면 refresh 후 1회 재시도. 지금은 그냥 던진다.
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body?.message ?? "요청을 처리하지 못했습니다.",
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
