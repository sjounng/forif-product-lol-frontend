import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LaneTag } from "@/components/ui/LaneTag";
import { LANES, LANE_LABEL } from "@/lib/constants";
import { formatRank, formatRiotId, ratingConfidence } from "@/lib/format";
import { mockPlayers } from "@/lib/mock";

/**
 * 담당: B — 명단 관리 (로드맵 2단계)
 *
 * TODO(B):
 *   1. mockPlayers → fetchPlayers(roomId)
 *   2. "선수 추가" 모달: displayName + Riot ID("GameName#TAG")
 *      → addPlayer(). Riot 조회는 느리므로 낙관적으로 행을 먼저 그리고
 *        sync_status 가 OK 로 바뀌면 티어를 채운다.
 *      → 조회 실패해도 등록은 되어야 한다. "티어 미확인" 배지를 달고 수동 점수 입력을 연다.
 *   3. 라인 가능도(lanePool) 인라인 편집. 0 = 배정 금지이며 팀 자동구성의 하드 제약이다.
 *      0을 준 라인은 브루트포스가 후보에서 아예 잘라낸다 — 실수로 0을 주면 구성이 실패하므로
 *      "이 라인엔 절대 안 넣습니다" 라고 분명히 쓸 것.
 *   4. 명단에서 내리기 = is_active=0 (삭제 아님, 전적 보존)
 *
 * TODO(B): "솔랭 갱신" 버튼 — 세션 시작 전 배치 1회면 충분하다(24h 캐시).
 *          20명이면 60콜이라 진행률 표시가 필요하다.
 */
export default function PlayersPage() {
  return (
    <main className="px-8 py-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-2">명단</p>
          <h1 className="text-xl font-semibold tracking-tight">
            등록된 선수 {mockPlayers.length}명
          </h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm">솔랭 갱신</Button>
          <Button variant="primary" size="sm">
            선수 추가
          </Button>
        </div>
      </div>

      <Card>
        {/* 헤더 */}
        <div className="flex items-center gap-4 border-b border-line px-5 py-2.5">
          <span className="eyebrow flex-1">선수</span>
          <span className="eyebrow hidden w-40 md:block">솔랭</span>
          <span className="eyebrow w-14 text-right">점수</span>
          <span className="eyebrow hidden w-16 text-right sm:block">전적</span>
          <span className="eyebrow hidden w-44 text-right lg:block">라인 가능도</span>
        </div>

        <ul>
          {mockPlayers.map((player) => (
            <li
              key={player.id}
              className="flex items-center gap-4 border-b border-line-soft px-5 py-3 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm">{player.displayName}</span>
                  {player.primaryLane && <LaneTag lane={player.primaryLane} />}
                </div>
                <p className="mt-0.5 truncate text-xs text-dim">
                  {formatRiotId(player.riotAccount)}
                </p>
              </div>

              <div className="hidden w-40 md:block">
                {player.riotAccount ? (
                  <span className="text-[13px] text-muted">
                    {formatRank(player.riotAccount)}
                  </span>
                ) : (
                  <Badge tone="quiet">티어 미확인</Badge>
                )}
              </div>

              <div className="w-14 text-right">
                <span className="tabular text-sm">
                  {player.rating.toLocaleString()}
                </span>
                <p
                  className="text-[10px] text-dim"
                  title={`RD ${player.rd} — 낮을수록 점수가 안정적입니다`}
                >
                  신뢰도 {ratingConfidence(player.rd)}
                </p>
              </div>

              <span className="tabular hidden w-16 text-right text-[13px] text-muted sm:block">
                {player.wins}승 {player.losses}패
              </span>

              {/* 라인 가능도: 0이면 배정 금지라 눈에 띄게 죽여둔다 */}
              <div className="hidden w-44 justify-end gap-1 lg:flex">
                {LANES.map((lane) => {
                  const score = player.lanePool[lane] ?? 0;
                  const banned = score === 0;
                  return (
                    <span
                      key={lane}
                      title={
                        banned
                          ? `${LANE_LABEL[lane]} — 배정 금지`
                          : `${LANE_LABEL[lane]} — 가능도 ${score}/5`
                      }
                      className={`tabular w-8 rounded border py-0.5 text-center text-[10px] ${
                        banned
                          ? "border-line-soft text-dim/40 line-through"
                          : score >= 4
                            ? "border-gold/30 bg-gold/10 text-gold"
                            : "border-line text-muted"
                      }`}
                    >
                      {LANE_LABEL[lane]}
                    </span>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
