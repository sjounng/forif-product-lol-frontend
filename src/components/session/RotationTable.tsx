import { Badge } from "@/components/ui/Badge";
import { LaneTag } from "@/components/ui/LaneTag";
import { PLAYERS_PER_MATCH } from "@/lib/constants";
import type { SessionPlayer } from "@/types";

/**
 * 로테이션 순번표 (DESIGN §4-A).
 * 정렬 기준: games_played ASC → bench_priority DESC → last_played_game_no ASC
 * 위에서 10명이 다음 판 후보다. 경계선을 실제로 그어서 보여준다.
 *
 * TODO(B): 방장이 순번을 수동으로 올릴 수 있어야 한다 (bench_priority).
 *          드래그보다 "▲ 먼저 투입" 버튼이 구현·조작 둘 다 싸다.
 */
export function RotationTable({ players }: { players: SessionPlayer[] }) {
  const eligible = players.filter((p) => p.status !== "WITHDRAWN");

  return (
    <ul>
      {eligible.map((player, index) => {
        const isNextUp = index < PLAYERS_PER_MATCH;
        const isCutLine = index === PLAYERS_PER_MATCH - 1;

        return (
          <li
            key={player.playerId}
            className={`flex items-center gap-3 px-5 py-2.5 ${
              isCutLine ? "border-b-2 border-dashed border-line" : "border-b border-line-soft"
            } ${isNextUp ? "" : "opacity-55"}`}
          >
            <span className="tabular w-5 text-right text-xs text-dim">
              {index + 1}
            </span>

            <span className="min-w-0 flex-1 truncate text-sm">
              {player.displayName}
            </span>

            {player.primaryLane && <LaneTag lane={player.primaryLane} />}

            <span className="tabular w-14 text-right text-[13px] text-muted">
              {player.rating.toLocaleString()}
            </span>

            <span
              className="tabular w-16 whitespace-nowrap text-right text-xs text-dim"
              title="이번 세션 출전 / 휴식 판수"
            >
              {player.gamesPlayed}판 · {player.gamesBenched}휴
            </span>

            <span className="w-16 text-right">
              {player.status === "BENCHED" && <Badge tone="quiet">대기</Badge>}
              {player.status === "PLAYING" && <Badge tone="gain">출전 중</Badge>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
