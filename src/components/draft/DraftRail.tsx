import { LANE_LABEL } from "@/lib/constants";
import type { Lane, Side } from "@/types";

export type PickSlot = {
  lane: Lane;
  player: string;
  champion: string;
  mark: string;
};

export type LockedChampion = {
  id: number;
  name: string;
  mark: string;
  setNo: number;
  source: "PREVIOUS_PICK" | "CURRENT_BAN";
};

function ChampionPortrait({ mark }: { mark: string }) {
  return (
    <span className="relative grid size-full place-items-center overflow-hidden bg-gradient-to-br from-raised via-surface to-bg">
      <span className="absolute size-2/3 rotate-45 border border-line" />
      <span className="tabular relative text-xl font-semibold text-text">{mark}</span>
    </span>
  );
}

export function DraftRail({
  side,
  teamName,
  picks,
  lockedChampions,
  activePickIndex,
}: {
  side: Side;
  teamName: string;
  picks: PickSlot[];
  lockedChampions: LockedChampion[];
  activePickIndex: number | null;
}) {
  const isBlue = side === "BLUE";
  const sideText = isBlue ? "text-blue" : "text-red";
  const sideBorder = isBlue ? "border-blue" : "border-red";
  const activeBg = isBlue ? "bg-blue-dim/25" : "bg-red-dim/25";

  return (
    <aside
      className={`flex min-h-0 flex-col border-line bg-surface/70 ${
        isBlue ? "border-r" : "border-l"
      }`}
      aria-label={`${side} 팀 픽`}
    >
      <div className={`flex h-12 shrink-0 items-center gap-3 border-b border-line px-4 ${sideText}`}>
        <span className={`tabular border px-2 py-1 text-[10px] font-semibold ${sideBorder}`}>
          {side}
        </span>
        <strong className="truncate text-sm text-text">{teamName}</strong>
      </div>

      <ol className="grid min-h-0 flex-1 grid-rows-5 gap-2 p-3">
        {picks.map((pick, index) => {
          const active = activePickIndex === index;
          return (
            <li
              key={pick.lane}
              className={`grid min-h-0 items-center overflow-hidden border border-line bg-bg/50 ${
                isBlue ? "grid-cols-[74px_1fr_24px]" : "grid-cols-[24px_1fr_74px]"
              } ${active ? `${sideBorder} ${activeBg}` : ""}`}
            >
              {isBlue ? (
                <>
                  <ChampionPortrait mark={pick.mark} />
                  <PickDetails pick={pick} align="left" />
                  <span className="tabular text-center text-[10px] text-dim">{index + 1}</span>
                </>
              ) : (
                <>
                  <span className="tabular text-center text-[10px] text-dim">{index + 1}</span>
                  <PickDetails pick={pick} align="right" />
                  <ChampionPortrait mark={pick.mark} />
                </>
              )}
            </li>
          );
        })}
      </ol>

      <div className="shrink-0 border-t border-line p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">LOCKED</span>
          <span className="tabular text-[9px] text-dim">{lockedChampions.length}</span>
        </div>
        <ul className="grid grid-cols-5 gap-1.5">
          {lockedChampions.map((champion) => (
            <li key={`${champion.source}-${champion.id}`} className="min-w-0" title={`${champion.name} · SET ${champion.setNo}`}>
              <div className="aspect-square overflow-hidden border border-line-soft opacity-55 grayscale">
                <ChampionPortrait mark={champion.mark} />
              </div>
              <p className="tabular mt-1 truncate text-center text-[7px] text-dim">
                {champion.source === "CURRENT_BAN" ? "BAN" : `SET ${champion.setNo}`}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function PickDetails({ pick, align }: { pick: PickSlot; align: "left" | "right" }) {
  return (
    <div className={`min-w-0 px-3 ${align === "right" ? "text-right" : ""}`}>
      <small className="text-[9px] tracking-wide text-muted">
        {LANE_LABEL[pick.lane]} · {pick.player}
      </small>
      <strong className="mt-1 block truncate text-[13px] text-text">{pick.champion}</strong>
    </div>
  );
}
