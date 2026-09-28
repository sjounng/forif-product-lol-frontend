import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { LaneTag } from "@/components/ui/LaneTag";
import type { SessionTeam, Side } from "@/types";

export function TeamBoard({
  side,
  team,
  canRename,
  saving,
  onRename,
}: {
  side: Side;
  team: SessionTeam | undefined;
  canRename: boolean;
  saving: boolean;
  onRename: () => void;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader
        title={team?.teamName ?? `${side} 팀`}
        action={
          // 버튼 유무와 관계없이 두 팀 헤더 높이를 같게 둔다 (버튼 높이 h-9 에 맞춤)
          <div className="flex h-9 items-center gap-2">
            {canRename && (
              <Button variant="ghost" size="sm" disabled={saving} onClick={onRename}>
                팀명 변경
              </Button>
            )}
            <span className="text-xs text-dim">
              팀장 {team?.captain.displayName ?? "—"}
            </span>
          </div>
        }
      />
      <ul>
        {team?.members.map((member) => (
          <li
            key={member.playerId}
            className="flex items-center gap-3 border-b border-line-soft px-5 py-3 last:border-0"
          >
            <span className="w-16 text-xs text-dim">
              <LaneTag lane={member.lane} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">
              {member.displayName}
            </span>
            {member.participantType !== "PLAYER" && (
              <span className="text-xs text-dim">{participantTypeLabel(member.participantType)}</span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function participantTypeLabel(type: SessionTeam["members"][number]["participantType"]) {
  return type === "MEMBER" ? "회원" : "게스트";
}
