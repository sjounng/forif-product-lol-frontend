import { LaneTag } from "@/components/ui/LaneTag";
import type { Lane, LockedChampionSource, Side } from "@/types";
import Image from "next/image";
import { championSquareUrl } from "@/lib/champion-art";

export type PickSlot = {
  lane: Lane;
  player: string;
  champion: string | null;
  mark: string;
  riotId: string | null;
  imageUrl: string | null;
};

export type LockedChampion = {
  id: number;
  name: string;
  mark: string;
  riotId: string;
  imageUrl: string | null;
  sourceMatchId: number | null;
  source: LockedChampionSource;
};

function ChampionPortrait({
  mark,
  riotId,
  imageUrl,
  name,
  className = "size-11",
}: {
  mark: string;
  riotId: string | null;
  imageUrl: string | null;
  name: string;
  className?: string;
}) {
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-md border border-line-soft bg-bg ${className}`}>
      {riotId ? (
        <Image src={championSquareUrl(riotId, imageUrl)} alt={name} fill sizes="48px" className="object-cover" />
      ) : (
        <span className="tabular text-base font-semibold text-dim">{mark}</span>
      )}
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
      className={`flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-surface transition-shadow ${
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
        <span className={`tabular rounded border px-2 py-1 text-xs font-semibold ${sideBorder}`}>
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
              className={`grid min-h-14 grid-cols-[24px_44px_minmax(0,1fr)] items-center gap-2 overflow-hidden rounded-lg border border-line bg-bg/50 px-2 transition-colors ${
                active ? `${sideBorder} ${activeBg} ring-1 ring-inset ${isBlue ? "ring-blue" : "ring-red"}` : ""
              }`}
            >
              <span className="tabular text-center text-xs text-dim">{index + 1}</span>
              <ChampionPortrait
                mark={pick.mark}
                riotId={pick.riotId}
                imageUrl={pick.imageUrl}
                name={pick.champion ?? "선택되지 않은 챔피언"}
              />
              <PickDetails pick={pick} />
            </li>
          );
        })}
      </ol>

      <div className="shrink-0 border-t border-line p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-muted">잠긴 챔피언</span>
          <span className="tabular text-sm text-dim">{lockedChampions.length}</span>
        </div>
        <ul className="grid max-h-24 grid-cols-5 gap-1.5 overflow-y-auto">
          {lockedChampions.map((champion) => (
            <li
              key={`${champion.source}-${champion.id}`}
              className="min-w-0"
              title={`${champion.name} · ${lockedSourceLabel(champion)}`}
            >
              <div className="aspect-square overflow-hidden rounded opacity-55 grayscale">
                <ChampionPortrait
                  mark={champion.mark}
                  riotId={champion.riotId}
                  imageUrl={champion.imageUrl}
                  name={champion.name}
                  className="size-full"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function PickDetails({ pick }: { pick: PickSlot }) {
  return (
    <div className="min-w-0">
      <span className="flex min-w-0 items-center gap-1 text-xs text-muted">
        <LaneTag lane={pick.lane} />
        <span className="truncate">· {pick.player}</span>
      </span>
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
