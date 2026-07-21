import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FEARLESS_LABEL } from "@/lib/constants";
import { mockRooms, mockSessions } from "@/lib/mock";
import type { SessionStatus } from "@/types";

const STATUS_LABEL: Record<SessionStatus, string> = {
  OPEN: "모집 중",
  IN_PROGRESS: "진행 중",
  FINISHED: "종료",
  CANCELLED: "취소됨",
};

/**
 * 담당: B
 *
 * 세션 = 내전 회차 = 피어리스 소진 범위. 이 경계가 이 제품의 핵심이라
 * 목록에서도 피어리스 모드를 항상 같이 보여준다.
 *
 * TODO(B):
 *   - mockSessions → fetchSessions(roomId)
 *   - "세션 열기" 모달: 이름, 피어리스 모드, 점수 반영 여부(친선전이면 off)
 *     피어리스 모드는 세션 생성 후 바꾸면 이미 소진된 풀과 어긋난다. 시작 후엔 잠글 것.
 *   - 진행 중 세션이 이미 있으면 새로 만들기 전에 경고
 */
export default async function SessionsPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const room = mockRooms.find((r) => r.id === Number(roomId)) ?? mockRooms[0];

  return (
    <main className="px-8 py-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-2">세션</p>
          <h1 className="text-xl font-semibold tracking-tight">내전 회차</h1>
          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-muted">
            피어리스 챔피언 풀은 세션 안에서만 유지됩니다. 세션이 끝나면 다음
            회차는 백지에서 시작합니다.
          </p>
        </div>
        <Button variant="primary" size="sm">
          세션 열기
        </Button>
      </div>

      <ul className="space-y-2">
        {mockSessions.map((session) => (
          <li key={session.id}>
            <Link
              href={`/rooms/${room.id}/sessions/${session.id}`}
              className="flex items-center gap-4 rounded-[10px] border border-line bg-surface px-5 py-4 transition-colors hover:border-dim"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[15px] font-medium">
                    {session.name ?? "이름 없는 세션"}
                  </span>
                  {session.status === "IN_PROGRESS" && (
                    <Badge tone="gain">{STATUS_LABEL[session.status]}</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-dim">{session.createdAt}</p>
              </div>

              <Badge tone={session.fearlessMode === "NONE" ? "neutral" : "gold"}>
                {FEARLESS_LABEL[session.fearlessMode]}
              </Badge>

              {!session.ratingEnabled && <Badge tone="quiet">점수 미반영</Badge>}

              <div className="hidden items-center gap-6 sm:flex">
                <div className="text-right">
                  <p className="tabular text-sm">{session.playerCount}</p>
                  <p className="eyebrow mt-0.5">참가</p>
                </div>
                <div className="text-right">
                  <p className="tabular text-sm">{session.gameCount}</p>
                  <p className="eyebrow mt-0.5">게임</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
