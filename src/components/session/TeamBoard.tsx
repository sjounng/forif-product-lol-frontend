import { LaneTag } from "@/components/ui/LaneTag";
import { LANES } from "@/lib/constants";
import type { BalanceAssignment, Lane, Side } from "@/types";

/**
 * 확정된 5인 라인업. 라인 순서(TOP→JGL→MID→ADC→SUP)는 절대 흐트러지면 안 된다 —
 * 양 팀을 나란히 놓고 같은 라인끼리 가로로 비교하는 화면이기 때문이다.
 */
export function TeamBoard({
  side,
  assignment,
}: {
  side: Side;
  assignment: BalanceAssignment[];
}) {
  const byLane = new Map<Lane, BalanceAssignment>();
  for (const a of assignment) {
    if (a.side === side) byLane.set(a.lane, a);
  }

  const total = assignment
    .filter((a) => a.side === side)
    .reduce((sum, a) => sum + a.effRating, 0);

  const accent = side === "BLUE" ? "text-blue" : "text-red";
  const border = side === "BLUE" ? "border-blue/25" : "border-red/25";

  return (
    <div className={`rounded-[10px] border ${border} bg-surface`}>
      <div className="flex items-baseline justify-between border-b border-line-soft px-4 py-3">
        <span className={`eyebrow ${accent}`}>{side}</span>
        <span className="tabular text-sm text-muted">
          {total.toLocaleString()}
        </span>
      </div>

      <ul>
        {LANES.map((lane) => {
          const slot = byLane.get(lane);
          return (
            <li
              key={lane}
              className="flex items-center gap-3 border-b border-line-soft px-4 py-2.5 last:border-b-0"
            >
              <LaneTag lane={lane} assignedFrom={slot?.assignedFrom} />
              <span className="min-w-0 flex-1 truncate text-sm">
                {slot?.displayName ?? <span className="text-dim">—</span>}
              </span>
              <span className="tabular text-[13px] text-muted">
                {slot ? slot.effRating.toLocaleString() : "—"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
