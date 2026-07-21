import Link from "next/link";
import { BalanceBeam } from "@/components/session/BalanceBeam";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { FEARLESS_LABEL } from "@/lib/constants";
import { mockMatches, mockPlayers, mockRooms, mockSessions } from "@/lib/mock";

/**
 * 방 개요. 방장이 들어오자마자 답을 얻어야 하는 질문은 하나다 —
 * "지금 진행 중인 세션이 있나, 다음에 뭘 눌러야 하나".
 * 그래서 진행 중 세션이 최상단이고 나머지는 요약이다.
 *
 * TODO(공통): 통계 집계(7단계)가 붙기 전까지 하단 카드는 목업으로 둔다.
 */
export default async function RoomOverviewPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const room = mockRooms.find((r) => r.id === Number(roomId)) ?? mockRooms[0];
  const liveSession = mockSessions.find((s) => s.status === "IN_PROGRESS");
  const topPlayers = [...mockPlayers].sort((a, b) => b.rating - a.rating).slice(0, 5);

  return (
    <main className="px-8 py-8">
      <div className="mb-8">
        <p className="eyebrow mb-2">개요</p>
        <h1 className="text-xl font-semibold tracking-tight">{room.name}</h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
        <StatTile label="등록 인원" value={String(room.playerCount)} sub="명단 전체" />
        <StatTile label="누적 세션" value={String(room.sessionCount)} sub="회차" />
        <StatTile label="누적 경기" value="43" sub="게임" />
        <StatTile label="평균 점수" value="1,740" sub="방 전체" />
      </div>

      {liveSession ? (
        <Card className="mb-6">
          <CardHeader
            eyebrow="진행 중"
            title={liveSession.name ?? "이름 없는 세션"}
            action={
              <Link href={`/rooms/${room.id}/sessions/${liveSession.id}`}>
                <Button variant="primary" size="sm">
                  세션 열기
                </Button>
              </Link>
            }
          />
          <div className="space-y-5 px-5 py-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="gold">{FEARLESS_LABEL[liveSession.fearlessMode]}</Badge>
              <Badge>{liveSession.playerCount}명 참가</Badge>
              <Badge>{liveSession.gameCount}게임 진행</Badge>
              {!liveSession.ratingEnabled && <Badge tone="quiet">점수 미반영</Badge>}
            </div>

            <div>
              <p className="eyebrow mb-3">직전 경기 팀 점수</p>
              <BalanceBeam
                blueTotal={mockMatches[0].blueTotal}
                redTotal={mockMatches[0].redTotal}
              />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="mb-6">
          <div className="px-5 py-8 text-center">
            <p className="text-sm">진행 중인 세션이 없습니다.</p>
            <p className="mt-1.5 text-[13px] text-dim">
              오늘 내전을 열려면 세션을 새로 만드세요.
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            eyebrow="점수 상위"
            title="랭킹"
            action={
              <Link
                href={`/rooms/${room.id}/leaderboard`}
                className="text-[13px] text-muted hover:text-text"
              >
                전체 보기
              </Link>
            }
          />
          <ul>
            {topPlayers.map((player, index) => (
              <li
                key={player.id}
                className="flex items-center gap-3 border-b border-line-soft px-5 py-2.5 last:border-b-0"
              >
                <span className="tabular w-4 text-xs text-dim">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {player.displayName}
                </span>
                <span className="tabular text-[13px]">
                  {player.rating.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader eyebrow="최근" title="경기 기록" />
          <ul>
            {mockMatches.map((match) => (
              <li
                key={match.id}
                className="border-b border-line-soft px-5 py-3 last:border-b-0"
              >
                <div className="mb-2 flex items-center gap-3">
                  <span className="tabular text-xs text-dim">
                    {match.gameNo}판
                  </span>
                  <span className="flex-1 text-[13px]">
                    <span
                      className={
                        match.winnerSide === "BLUE" ? "text-blue" : "text-red"
                      }
                    >
                      {match.winnerSide}
                    </span>{" "}
                    승리
                  </span>
                  <span className="tabular text-xs text-dim">
                    {match.endedAt}
                  </span>
                </div>
                <BalanceBeam
                  blueTotal={match.blueTotal}
                  redTotal={match.redTotal}
                  compact
                />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </main>
  );
}
