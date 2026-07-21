"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

/**
 * 전역 네비게이션 바.
 *
 *   왼쪽 = 로고 (홈)
 *   가운데 = 그룹 · 티어
 *   오른쪽 = 로그인 / 로그아웃
 *
 * 방 안으로 들어가면 방 스코프 메뉴(명단·랭킹·세션·설정)는 사이드바가 맡는다.
 * 이 바는 "어느 방에 있든 항상 같은 것"만 담는다.
 */
const NAV = [
  { href: "/rooms", label: "그룹", match: "/rooms" },
  { href: "/tier", label: "티어", match: "/tier" },
];

export function NavBar() {
  const pathname = usePathname();
  const { user, isLoggedIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-6">
        {/* 왼쪽 — 로고 */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="내전 콘솔 홈"
        >
          <Logo className="h-5 w-5 text-text" />
          <span className="text-sm font-semibold tracking-tight">내전 콘솔</span>
        </Link>

        {/* 가운데 — 그룹 · 티어 */}
        <nav className="flex flex-1 items-center justify-center gap-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3.5 py-1.5 text-[13px] transition-colors ${
                  active
                    ? "bg-raised font-medium text-text"
                    : "text-muted hover:bg-raised/60 hover:text-text"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 오른쪽 — 인증 */}
        <div className="flex shrink-0 items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="hidden text-[13px] text-muted sm:inline">
                {user?.displayName}
              </span>
              {/* TODO(A): onClick → logout() 후 "/" 로 */}
              <Button size="sm" variant="ghost">
                로그아웃
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="primary">
                로그인
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
