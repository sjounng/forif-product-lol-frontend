"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <header className="sticky top-0 z-50 border-b border-line bg-black">
      <div className="mx-auto flex h-20 max-w-6xl items-center px-6">
        {/* 왼쪽 — 로고 */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
          aria-label="내전하냥 홈"
        >
          <Image src="/foxBlue.svg" alt="" width={38} height={36} className="h-9 w-auto" priority />
          <span className="text-xl font-bold tracking-tight text-white">내전하냥</span>
        </Link>

        {/* 가운데 — 그룹 · 티어 */}
        <nav className="flex flex-1 items-center justify-center gap-2">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-4 py-2 text-base transition-colors ${
                  active
                    ? "bg-white/15 font-bold text-white"
                    : "font-medium text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 오른쪽 — 인증 */}
        <div className="flex shrink-0 items-center gap-4">
          {isLoggedIn ? (
            <>
              <span className="hidden text-base text-white/80 sm:inline">
                {user?.displayName}
              </span>
              {/* TODO(A): onClick → logout() 후 "/" 로 */}
              <Button size="md" variant="ghost" className="!text-white hover:!bg-white/10">
                로그아웃
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="md" variant="primary">
                로그인
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
