"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 방 스코프 네비게이션. 방을 고른 뒤에는 모든 작업이 이 5개 안에서 일어난다.
 *
 * TODO(공통): 모바일(md 미만)에서는 상단 가로 스크롤 탭으로 바꿔야 한다.
 *             게스트는 이 사이드바를 아예 보지 않는다(관전 전용 레이아웃).
 */
const NAV = [
  { segment: "", label: "개요" },
  { segment: "players", label: "명단" },
  { segment: "leaderboard", label: "랭킹" },
  { segment: "sessions", label: "세션" },
  { segment: "settings", label: "설정" },
];

export function Sidebar({ roomId, roomName }: { roomId: number; roomName: string }) {
  const pathname = usePathname();
  const base = `/rooms/${roomId}`;

  return (
    <aside className="hidden w-56 shrink-0 border-r border-line md:block">
      <div className="border-b border-line px-5 py-5">
        <Link href="/rooms" className="eyebrow hover:text-muted">
          ← 방 목록
        </Link>
        <p className="mt-2.5 text-sm font-semibold leading-snug">{roomName}</p>
      </div>

      <nav className="p-2">
        {NAV.map((item) => {
          const href = item.segment ? `${base}/${item.segment}` : base;
          const active = item.segment
            ? pathname.startsWith(href)
            : pathname === base;

          return (
            <Link
              key={item.segment}
              href={href}
              className={`block rounded-md px-3 py-2 text-[13px] transition-colors ${
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
    </aside>
  );
}
