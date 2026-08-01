import { LaneTag } from "@/components/ui/LaneTag";
import type { Lane, LockedChampionSource, Side } from "@/types";
import Image from "next/image";

export type PickSlot = {
  lane: Lane;
  player: string;
  champion: string | null;
  mark: string;
  imageUrl: string | null;
};

export type LockedChampion = {
  id: number;
  name: string;
  mark: string;
  imageUrl: string | null;
  sourceMatchId: number | null;
  source: LockedChampionSource;
};

function ChampionPortrait({ mark, imageUrl, name }: { mark: string; imageUrl: string | null; name: string }) {
  return (
    <span className="relative grid aspect-square w-full place-items-center overflow-hidden bg-black">
      {imageUrl ? <Image src={imageUrl} alt={name} fill sizes="80px" className="object-contain" /> : <><span className="absolute size-2/3 rotate-45 border border-line" /><span className="tabular relative text-xl font-semibold text-text">{mark}</span></>}
    </span>
  );
}

export function DraftRail({
  side,
  teamName,
  picks,
  lockedChampions,
  activePickIndices,
  activeTurn,
}: {
  side: Side;
  teamName: string;
  picks: PickSlot[];
  lockedChampions: LockedChampion[];
  activePickIndices: readonly number[];
  activeTurn: boolean;
}) {
  const isBlue = side === "BLUE";
  const sideText = isBlue ? "text-blue" : "text-red";
  const sideBorder = isBlue ? "border-blue" : "border-red";
  const activeBg = isBlue ? "bg-blue-dim/25" : "bg-red-dim/25";

  return (
    <aside
      className={`flex min-h-0 flex-col border-line bg-surface/70 transition-shadow ${
        isBlue ? "border-r" : "border-l"
      } ${
        activeTurn
          ? isBlue
            ? "shadow-[inset_0_0_0_2px_var(--color-blue)]"
            : "shadow-[inset_0_0_0_2px_var(--color-red)]"
          : ""
      }`}
      aria-label={`${side} 팀 픽`}
    >
      <div className={`flex h-12 shrink-0 items-center gap-3 border-b px-4 ${sideText} ${
        activeTurn ? `${sideBorder} ${activeBg}` : "border-line"
      }`}>
        <span className={`tabular border px-2 py-1 text-[10px] font-semibold ${sideBorder}`}>
          {side}
        </span>
        <strong className="truncate text-sm text-text">{teamName}</strong>
      </div>

      <ol className="grid min-h-0 flex-1 grid-rows-5 gap-2 p-3">
        {picks.map((pick, index) => {
          const active = activePickIndices.includes(index);
          return (
            <li
              key={pick.lane}
              className={`grid min-h-0 items-center overflow-hidden border border-line bg-bg/50 ${
                isBlue ? "grid-cols-[74px_1fr_24px]" : "grid-cols-[24px_1fr_74px]"
              } ${active ? `${sideBorder} ${activeBg} ring-1 ring-inset ${isBlue ? "ring-blue" : "ring-red"}` : ""}`}
            >
              {isBlue ? (
                <>
                  <ChampionPortrait mark={pick.mark} imageUrl={pick.imageUrl} name={pick.champion ?? "선택되지 않은 챔피언"} />
                  <PickDetails pick={pick} align="left" />
                  <span className="tabular text-center text-[10px] text-dim">{index + 1}</span>
                </>
              ) : (
                <>
                  <span className="tabular text-center text-[10px] text-dim">{index + 1}</span>
                  <PickDetails pick={pick} align="right" />
                  <ChampionPortrait mark={pick.mark} imageUrl={pick.imageUrl} name={pick.champion ?? "선택되지 않은 챔피언"} />
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
        <ul className="grid max-h-24 grid-cols-5 gap-1.5 overflow-y-auto">
          {lockedChampions.map((champion) => (
            <li
              key={`${champion.source}-${champion.id}`}
              className="min-w-0"
              title={`${champion.name} · ${lockedSourceLabel(champion)}`}
            >
              <div className="aspect-square overflow-hidden border border-line-soft opacity-55 grayscale">
                <ChampionPortrait mark={champion.mark} imageUrl={champion.imageUrl} name={champion.name} />
              </div>
              <p className="tabular mt-1 truncate text-center text-[7px] text-dim">
                {lockedSourceLabel(champion)}
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
      <small className={`flex items-center gap-1 text-[9px] tracking-wide text-muted ${align === "right" ? "justify-end" : ""}`}>
        <LaneTag lane={pick.lane} /> · {pick.player}
      </small>
      <strong className="mt-1 block truncate text-[13px] text-text">
        {pick.champion ?? "미배정"}
      </strong>
    </div>
  );
}

function lockedSourceLabel(champion: LockedChampion) {
  if (champion.source === "CURRENT_BAN") return "BAN";
  if (champion.source === "CURRENT_PICK") return "PICK";
  return champion.sourceMatchId ? `M${champion.sourceMatchId}` : "이전";
}
