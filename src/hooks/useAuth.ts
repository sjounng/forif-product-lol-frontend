"use client";

import type { User } from "@/types";

/**
 * 담당: A
 *
 * 지금은 목업이라 고정값을 돌려준다. 화면 확인용으로 isLoggedIn 을 손으로 바꿔보면
 * 네비게이션 바의 로그인/로그아웃 전환을 볼 수 있다.
 *
 * TODO(A): 실제 구현
 *   1. Context + Provider 로 올린다 (앱 전역이 같은 인스턴스를 봐야 한다)
 *   2. 마운트 시 GET /api/auth/me 로 세션 복구. 401 이면 refresh 1회 시도
 *   3. accessToken 은 메모리에만. refreshToken 은 httpOnly 쿠키로 서버가 심는다
 *   4. logout() → POST /api/auth/logout 후 토큰 비우고 "/" 로
 *   5. 복구가 끝나기 전 상태(loading)를 구분할 것 — 안 그러면 로그인한 사용자에게도
 *      로그인 버튼이 한 번 깜빡인다
 */
export function useAuth(): {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
} {
  const isLoggedIn = false;

  return {
    user: isLoggedIn
      ? { id: 1, email: "owner@test.com", displayName: "방장", avatarUrl: null }
      : null,
    isLoggedIn,
    loading: false,
  };
}
