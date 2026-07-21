import { Card } from "@/components/ui/Card";
import { LaneTag } from "@/components/ui/LaneTag";
import { formatRank, formatWinRate } from "@/lib/format";
import { mockPlayers } from "@/lib/mock";

/**
 * 담당: B
 *
 * 점수는 방 단위다. 같은 롤 계정이 A방·B방에 있어도 점수가 따로 논다.
 * 시드(솔랭 환산)만 같은 출발점이고, 내전 5경기면 실제 내전 실력으로 수렴한다.
 *
 * TODO(B):
 *   - mockPlayers → GET /api/rooms/{roomId}/players (rating DESC)
 *   - 점수 옆에 최근 변동(rating_history)을 +18 / -12 로 표시
 *   - 행 클릭 → 선수 상세: 챔피언별·라인별 전적, 점수 추이 그래프
 *     "왜 20점밖에 안 올랐냐"에 답하려면 rating_history 의 E/K/계수를 그대로 보여줘야 한다
 *   - 경기 5판 미만은 점수를 흐리게. RD 350이면 아직 시드값이나 다름없다
 */
export default function LeaderboardPage() {
  const ranked = [...mockPlayers].sort((a, b) => b.rating - a.rating);

  return (
    <main className="px-8 py-8">
      <div className="mb-8">
        <p className="eyebrow mb-2">랭킹</p>
        <h1 className="text-xl font-semibold tracking-tight">방 내전 점수</h1>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
          솔랭 티어는 출발점일 뿐입니다. 내전 5경기면 이 방에서의 실제 실력으로
          수렴합니다.
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-4 border-b border-line px-5 py-2.5">
          <span className="eyebrow w-8">순위</span>
          <span className="eyebrow flex-1">선수</span>
          <span className="eyebrow hidden w-36 sm:block">솔랭</span>
          <span className="eyebrow w-16 text-right">전적</span>
          <span className="eyebrow w-12 text-right">승률</span>
          <span className="eyebrow w-16 text-right">점수</span>
        </div>

        <ul>
          {ranked.map((player, index) => {
            const provisional = player.gamesPlayed < 5;
            return (
              <li
                key={player.id}
                className="flex items-center gap-4 border-b border-line-soft px-5 py-3 last:border-b-0"
              >
                <span
                  className={`tabular w-8 text-sm ${index < 3 ? "text-gold" : "text-dim"}`}
                >
                  {index + 1}
                </span>

                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-sm">{player.displayName}</span>
                  {player.primaryLane && <LaneTag lane={player.primaryLane} />}
                </div>

                <span className="hidden w-36 text-[13px] text-muted sm:block">
                  {formatRank(player.riotAccount)}
                </span>

                <span className="tabular w-16 text-right text-[13px] text-muted">
                  {player.wins}-{player.losses}
                </span>

                <span className="tabular w-12 text-right text-[13px] text-muted">
                  {formatWinRate(player.wins, player.gamesPlayed)}
                </span>

                <span
                  className={`tabular w-16 text-right text-sm ${provisional ? "text-dim" : ""}`}
                  title={provisional ? "5경기 미만 — 아직 시드 점수에 가깝습니다" : undefined}
                >
                  {player.rating.toLocaleString()}
                  {provisional && "?"}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </main>
  );
}
