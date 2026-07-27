"use client";

import type { Champion } from "@/types";

export type DraftChampion = Champion & {
  mark: string;
  disabledReason?: string;
};

export function ChampionGrid({
  champions,
  selectedChampionId,
  onSelect,
}: {
  champions: DraftChampion[];
  selectedChampionId: number | null;
  onSelect: (championId: number) => void;
}) {
  return (
    <div className="grid h-full min-h-0 grid-cols-6 content-start items-start gap-2 overflow-x-hidden overflow-y-auto overscroll-contain pr-1 [grid-auto-rows:max-content] [scrollbar-color:var(--color-line)_var(--color-surface)] [scrollbar-width:thin]">
      {champions.map((champion) => {
        const selected = champion.id === selectedChampionId;
        const disabled = Boolean(champion.disabledReason);
        const title = champion.disabledReason
          ? `${champion.nameKo} — ${champion.disabledReason}`
          : champion.nameKo;

        return (
          <button
            key={champion.id}
            type="button"
            disabled={disabled}
            aria-label={title}
            aria-pressed={selected}
            title={title}
            onClick={() => onSelect(champion.id)}
            className={`group relative block aspect-square w-full min-w-0 self-start overflow-hidden border transition-colors ${
              selected
                ? "border-gold ring-2 ring-gold/30"
                : disabled
                  ? "cursor-not-allowed border-line-soft bg-surface/40 opacity-30 grayscale"
                  : "border-line bg-surface hover:border-gold"
            }`}
          >
            <span className="absolute inset-0 grid place-items-center bg-gradient-to-br from-raised via-surface to-bg">
              <span className="tabular text-lg font-semibold text-muted transition-colors group-hover:text-text">
                {champion.mark}
              </span>
            </span>
            {selected && (
              <span className="absolute right-1 top-1 bg-gold px-1.5 py-0.5 text-[7px] font-bold text-bg">
                PICK
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
