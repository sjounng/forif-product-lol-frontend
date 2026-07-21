import type { ReactNode } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { mockUser } from "@/lib/mock";

/**
 * 방장 전용 영역. 이 그룹 아래는 전부 로그인이 필요하다.
 *
 * TODO(A): 인증 가드. 토큰 없으면 /login 으로 replace.
 *          middleware.ts 에서 쿠키를 보고 막는 편이 깜빡임이 없다.
 */
export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar userName={mockUser.displayName} />
      <div className="flex flex-1">{children}</div>
    </div>
  );
}
