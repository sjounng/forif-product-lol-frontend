import type { Champion, DraftStep, Side } from "@/types";

/**
 * 한 팀의 밴/픽 슬롯. 진행 중인 스텝은 테두리가 살아 있다.
 *
 * TODO(A): 확정 전 호버(draft_hovers)를 반투명으로 겹쳐 보여준다.
 *          상대가 뭘 만지작거리는지 보이는 게 밴픽의 재미이자 정보다.
 */
export function DraftRail({
  side,
  steps,
  champions,
  currentStep,
}: {
  side: Side;
  steps: DraftStep[];
  champions: Champion[];
  currentStep: number;
}) {
  const mySteps = steps.filter((s) => s.side === side);
  const picks = mySteps.filter((s) => s.actionType === "PICK");
  const bans = mySteps.filter((s) => s.actionType === "BAN");

  const nameOf = (championId: number | null) =>
    championId ? champions.find((c) => c.id === championId)?.nameKo : null;

  const accent = side === "BLUE" ? "border-blue" : "border-red";
  const accentText = side === "BLUE" ? "text-blue" : "text-red";

  return (
    <div className="w-full sm:w-44">
      <p className={`eyebrow mb-3 ${accentText}`}>{side}</p>

      {/* 픽 */}
      <ul className="space-y-1.5">
        {picks.map((step) => {
          const name = nameOf(step.championId);
          const active = step.stepNo === currentStep;
          return (
            <li
              key={step.stepNo}
              className={`flex h-12 items-center rounded-md border px-3 ${
                active
                  ? `${accent} bg-raised`
                  : name
                    ? "border-line bg-surface"
                    : "border-line-soft bg-surface/40"
              }`}
            >
              <span className={`text-[13px] ${name ? "" : "text-dim"}`}>
                {name ?? (active ? "선택 중…" : "—")}
              </span>
            </li>
          );
        })}
      </ul>

      {/* 밴 */}
      <p className="eyebrow mb-2 mt-4">밴</p>
      <ul className="flex gap-1.5">
        {bans.map((step) => {
          const name = nameOf(step.championId);
          const active = step.stepNo === currentStep;
          return (
            <li
              key={step.stepNo}
              title={name ?? undefined}
              className={`flex h-9 flex-1 items-center justify-center rounded border text-[10px] ${
                active
                  ? `${accent} bg-raised`
                  : name
                    ? "border-line bg-surface text-dim line-through"
                    : "border-line-soft bg-surface/40 text-dim/40"
              }`}
            >
              {name ? name.slice(0, 3) : "—"}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
