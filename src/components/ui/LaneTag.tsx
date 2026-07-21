import { LANE_LABEL } from "@/lib/constants";
import type { AssignedFrom, Lane, LanePreference } from "@/types";

/**
 * 라인 표시. 항상 3글자 고정폭이라 표에서 세로로 정렬된다.
 * 오프롤이면 색으로 구분한다 — 팀 구성 화면에서 "누가 양보했는지"가 바로 보여야 한다.
 */
export function LaneTag({
  lane,
  assignedFrom,
}: {
  lane: Lane | LanePreference;
  assignedFrom?: AssignedFrom;
}) {
  const offRole = assignedFrom === "OFF_ROLE" || assignedFrom === "FILL";
  return (
    <span
      className={`tabular text-[11px] tracking-wider ${
        offRole ? "text-gold" : "text-dim"
      }`}
      title={offRole ? "오프롤 배정" : undefined}
    >
      {LANE_LABEL[lane]}
      {offRole && "*"}
    </span>
  );
}
