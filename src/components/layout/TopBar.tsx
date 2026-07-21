import Link from "next/link";

/**
 * TODO(A): mockUser 대신 useAuth() 의 실제 사용자를 쓴다.
 *          로그아웃은 POST /api/auth/logout 후 토큰 비우고 /login 으로.
 */
export function TopBar({ userName }: { userName: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-line px-6">
      <Link href="/rooms" className="flex items-baseline gap-2">
        <span className="text-sm font-semibold tracking-tight">내전 콘솔</span>
      </Link>

      <div className="flex items-center gap-4">
        <span className="text-[13px] text-muted">{userName}</span>
        <button className="text-[13px] text-dim transition-colors hover:text-text">
          로그아웃
        </button>
      </div>
    </header>
  );
}
