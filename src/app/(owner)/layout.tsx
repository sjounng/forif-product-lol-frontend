import type { ReactNode } from "react";
import { NavBar } from "@/components/layout/NavBar";

/**
 * 방장 전용 영역. 이 그룹 아래는 전부 로그인이 필요하다.
 *
 * 상단 바는 전역 NavBar 하나로 통일했다. 방 스코프 메뉴(명단·랭킹·세션·설정)는
 * 방 안으로 들어간 뒤 사이드바가 맡는다.
 *
 * TODO(A): 인증 가드. 토큰 없으면 /login 으로 replace.
 *          middleware.ts 에서 쿠키를 보고 막는 편이 깜빡임이 없다.
 */
export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <NavBar />
      <div className="flex flex-1">{children}</div>
    </div>
  );
}
