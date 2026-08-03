"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { segment: "", label: "개요" },
  { segment: "players", label: "참가자" },
  { segment: "leaderboard", label: "랭킹" },
  { segment: "sessions", label: "세션" },
  { segment: "settings", label: "설정" },
];

export function Sidebar({ roomId, roomName, open, onToggle }: { roomId: number; roomName: string; open: boolean; onToggle(): void }) {
  const pathname = usePathname();
  const base = `/rooms/${roomId}`;
  return (
    <>
      <button type="button" onClick={onToggle} aria-label={open ? "그룹 메뉴 닫기" : "그룹 메뉴 열기"} aria-expanded={open} className="fixed left-3 top-24 z-50 flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-sm text-muted hover:text-text md:hidden">
        {open ? "‹" : "›"}
      </button>
      <aside className={`${open ? "translate-x-0 md:w-56" : "-translate-x-full md:w-14 md:translate-x-0"} fixed bottom-0 left-0 top-20 z-40 w-56 shrink-0 border-r border-line bg-bg transition-[transform,width] md:relative md:top-0`}>
        <div className="border-b border-line px-3 py-5">
          <div className="flex items-center justify-between gap-2">
            {open && <Link href="/rooms" className="eyebrow hover:text-muted">← 그룹 목록</Link>}
            <button type="button" onClick={onToggle} className="hidden h-8 w-8 shrink-0 rounded-md text-muted hover:bg-raised hover:text-text md:block" aria-label={open ? "그룹 메뉴 접기" : "그룹 메뉴 펼치기"}>{open ? "‹" : "›"}</button>
          </div>
          {open && <p className="mt-2.5 px-2 text-sm font-semibold leading-snug">{roomName}</p>}
        </div>
        <nav className="p-2">
          {NAV.map((item) => {
            const href = item.segment ? `${base}/${item.segment}` : base;
            const active = item.segment ? pathname.startsWith(href) : pathname === base;
            return (
              <Link key={item.segment} href={href} title={!open ? item.label : undefined} className={`block rounded-md px-3 py-2 text-[13px] transition-colors ${active ? "bg-raised font-medium text-text" : "text-muted hover:bg-raised/60 hover:text-text"}`}>
                {open ? item.label : item.label.slice(0, 1)}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
