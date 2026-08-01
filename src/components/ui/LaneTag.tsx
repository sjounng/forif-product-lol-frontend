import { LaneIcon } from "@/components/ui/LaneIcon";
import { LANE_LABEL } from "@/lib/constants";
import type { AssignedFrom, Lane, LanePreference } from "@/types";

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
      className={`tabular inline-flex items-center gap-1 text-[11px] tracking-wider ${
        offRole ? "text-gold" : "text-dim"
      }`}
      title={offRole ? "오프롤 배정" : undefined}
    >
      {lane !== "FILL" && <LaneIcon lane={lane} size={20} />}
      {LANE_LABEL[lane]}
      {offRole && "*"}
    </span>
  );
}
