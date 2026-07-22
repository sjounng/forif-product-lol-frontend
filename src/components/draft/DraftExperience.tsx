"use client";

import { useMemo, useState } from "react";
import { ChampionGrid, type DraftChampion } from "@/components/draft/ChampionGrid";
import {
  DraftRail,
  type LockedChampion,
  type PickSlot,
} from "@/components/draft/DraftRail";
import { LANES } from "@/lib/constants";
import { mockChampions, mockDraftSteps } from "@/lib/mock";
import type { Lane, Side } from "@/types";

type RoleFilter = Lane | "ALL";

const BLUE_PICKS: PickSlot[] = [
  { lane: "TOP", player: "제우스", champion: "아트록스", mark: "AT" },
  { lane: "JUNGLE", player: "오너", champion: "리 신", mark: "LS" },
  { lane: "MID", player: "페이커", champion: "아지르", mark: "AZ" },
  { lane: "ADC", player: "구마유시", champion: "케이틀린", mark: "CA" },
  { lane: "SUPPORT", player: "케리아", champion: "바드", mark: "BR" },
];

const RED_PICKS: PickSlot[] = [
  { lane: "TOP", player: "도란", champion: "카밀", mark: "CM" },
  { lane: "JUNGLE", player: "캐니언", champion: "니달리", mark: "ND" },
  { lane: "MID", player: "쵸비", champion: "아리", mark: "AH" },
  { lane: "ADC", player: "페이즈", champion: "애쉬", mark: "AS" },
  { lane: "SUPPORT", player: "리헨즈", champion: "알리스타", mark: "AL" },
];

const BLUE_LOCKED: LockedChampion[] = [
  { id: 887, name: "그웬", mark: "GW", setNo: 1, source: "PREVIOUS_PICK" },
  { id: 254, name: "바이", mark: "VI", setNo: 1, source: "PREVIOUS_PICK" },
  { id: 61, name: "오리아나", mark: "OR", setNo: 1, source: "PREVIOUS_PICK" },
  { id: 58, name: "레넥톤", mark: "RN", setNo: 2, source: "CURRENT_BAN" },
  { id: 134, name: "신드라", mark: "SY", setNo: 2, source: "CURRENT_BAN" },
];

const RED_LOCKED: LockedChampion[] = [
  { id: 498, name: "자야", mark: "XY", setNo: 1, source: "PREVIOUS_PICK" },
  { id: 497, name: "라칸", mark: "RK", setNo: 1, source: "PREVIOUS_PICK" },
  { id: 113, name: "세주아니", mark: "SJ", setNo: 1, source: "PREVIOUS_PICK" },
  { id: 84, name: "아칼리", mark: "AK", setNo: 2, source: "CURRENT_BAN" },
  { id: 62, name: "오공", mark: "WK", setNo: 2, source: "CURRENT_BAN" },
];

const CHAMPION_ROLES: Partial<Record<number, Lane[]>> = {
  266: ["TOP"], 103: ["MID"], 84: ["MID", "TOP"], 12: ["SUPPORT"],
  32: ["JUNGLE"], 34: ["MID"], 1: ["MID"], 22: ["ADC"],
  136: ["MID"], 268: ["MID"], 432: ["SUPPORT"], 53: ["SUPPORT"],
  63: ["MID"], 201: ["SUPPORT"], 51: ["ADC"], 164: ["TOP"],
  69: ["MID"], 31: ["TOP"], 42: ["ADC"], 122: ["TOP"],
  131: ["JUNGLE", "MID"], 119: ["ADC"], 36: ["TOP"], 245: ["JUNGLE", "MID"],
  60: ["JUNGLE"], 28: ["JUNGLE"], 81: ["ADC"], 9: ["JUNGLE"],
  114: ["TOP"], 105: ["MID"], 3: ["MID", "SUPPORT"], 41: ["TOP"],
  86: ["TOP"], 150: ["TOP"], 79: ["JUNGLE", "TOP"], 104: ["JUNGLE"],
};

const MARK_BY_RIOT_ID: Record<string, string> = {
  Aatrox: "AT", Ahri: "AH", Akali: "AK", Alistar: "AL", Amumu: "AM",
  Anivia: "AN", Annie: "NI", Ashe: "AS", AurelionSol: "AU", Azir: "AZ",
  Bard: "BR", Blitzcrank: "BL", Brand: "BN", Braum: "BM", Caitlyn: "CA",
  Camille: "CM", Cassiopeia: "CS", Chogath: "CH", Corki: "CO", Darius: "DA",
  Diana: "DI", Draven: "DR", DrMundo: "MD", Ekko: "EK", Elise: "EL",
  Evelynn: "EV", Ezreal: "EZ", Fiddlesticks: "FI", Fiora: "FO", Fizz: "FZ",
  Galio: "GA", Gangplank: "GP", Garen: "GR", Gnar: "GN", Gragas: "GG", Graves: "GV",
};

const CURRENT_STEP =
  mockDraftSteps.find((step) => step.championId === null)?.stepNo ?? 21;

function getActivePickIndex(side: Side): number | null {
  const activeStep = mockDraftSteps.find((step) => step.stepNo === CURRENT_STEP);
  if (!activeStep || activeStep.side !== side || activeStep.actionType !== "PICK") return null;

  return mockDraftSteps.filter(
    (step) => step.side === side && step.actionType === "PICK" && step.stepNo < CURRENT_STEP,
  ).length;
}

export function DraftExperience({ draftId }: { draftId: string }) {
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [query, setQuery] = useState("");
  const [selectedChampionId, setSelectedChampionId] = useState<number | null>(34);

  const usedChampionIds = useMemo(
    () => mockDraftSteps.flatMap((step) => step.championId ?? []),
    [],
  );
  const lockedChampionIds = useMemo(
    () => new Set([...BLUE_LOCKED, ...RED_LOCKED].map((champion) => champion.id)),
    [],
  );

  const champions = useMemo<DraftChampion[]>(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko");
    return mockChampions
      .filter((champion) => role === "ALL" || CHAMPION_ROLES[champion.id]?.includes(role))
      .filter((champion) =>
        `${champion.nameKo} ${champion.riotId}`.toLocaleLowerCase("ko").includes(normalizedQuery),
      )
      .map((champion) => ({
        ...champion,
        mark: MARK_BY_RIOT_ID[champion.riotId] ?? champion.riotId.slice(0, 2).toUpperCase(),
        disabledReason: usedChampionIds.includes(champion.id)
          ? "이번 매치에서 이미 선택됨"
          : lockedChampionIds.has(champion.id)
            ? "이번 세션에서 소진됨"
            : undefined,
      }));
  }, [lockedChampionIds, query, role, usedChampionIds]);

  const selectedChampion = mockChampions.find((champion) => champion.id === selectedChampionId);
  const activeStep = mockDraftSteps.find((step) => step.stepNo === CURRENT_STEP);

  return (
    <main className="flex h-dvh min-h-[640px] flex-col overflow-hidden bg-bg text-text">
      <header className="grid h-[86px] shrink-0 grid-cols-[1fr_310px_1fr] border-b border-line bg-surface">
        <TeamHeader side="BLUE" teamName="균형의 수호자" score={0} />
        <section className="flex flex-col items-center justify-center gap-1 border-x border-line bg-raised">
          <small className="eyebrow">한타대학교 정기 내전</small>
          <strong className="text-sm tracking-[0.16em]">소환사의 협곡</strong>
          <span className="tabular text-[9px] text-muted">3번째 세션 · 2번째 매치 · #{draftId}</span>
        </section>
        <TeamHeader side="RED" teamName="협곡의 지배자" score={1} />
      </header>

      <section className="grid h-[60px] shrink-0 grid-cols-[1fr_310px_1fr] border-b border-line bg-surface">
        <Timer side="BLUE" reserve="0:38" />
        <div className="relative flex flex-col items-center justify-center bg-text text-bg">
          <span className="tabular text-[8px] tracking-[0.2em] text-dim">{CURRENT_STEP} / {mockDraftSteps.length}</span>
          <strong className="text-xs tracking-[0.12em]">{activeStep?.side} TEAM {activeStep?.actionType}</strong>
          <span className={`absolute inset-x-16 bottom-0 h-0.5 ${activeStep?.side === "BLUE" ? "bg-blue" : "bg-red"}`} />
        </div>
        <Timer side="RED" reserve="0:38" />
      </section>

      <section className="grid min-h-0 flex-1 grid-cols-[minmax(230px,290px)_minmax(440px,1fr)_minmax(230px,290px)] overflow-hidden">
        <DraftRail side="BLUE" teamName="균형의 수호자" picks={BLUE_PICKS} lockedChampions={BLUE_LOCKED} activePickIndex={getActivePickIndex("BLUE")} />

        <section className="flex min-h-0 min-w-0 flex-col bg-bg px-7 py-5">
          <div className="flex shrink-0 items-end justify-between border-b border-line">
            <strong className="border-b-2 border-gold pb-3 text-xs tracking-wide">CHAMPIONS</strong>
            <span className="tabular pb-3 text-[10px] text-dim">{champions.length} AVAILABLE</span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 py-3">
            {(["ALL", ...LANES] as RoleFilter[]).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={role === item}
                onClick={() => setRole(item)}
                className={`border px-3 py-1.5 text-[10px] ${role === item ? "border-line bg-raised text-text" : "border-transparent text-muted hover:text-text"}`}
              >
                {item}
              </button>
            ))}
            <label className="ml-auto flex h-8 w-48 items-center gap-2 border border-line bg-surface px-3 text-muted">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">챔피언 검색</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search champion"
                className="min-w-0 flex-1 bg-transparent text-[11px] text-text outline-none placeholder:text-dim"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <ChampionGrid champions={champions} selectedChampionId={selectedChampionId} onSelect={setSelectedChampionId} />
          </div>

          <footer className="flex h-[62px] shrink-0 items-center justify-between border-t border-line pt-2">
            <div className="flex items-center gap-3">
              <span className="border border-gold px-2 py-1.5 text-[8px] font-bold text-gold">PICK</span>
              <p className="flex flex-col">
                <small className="text-[8px] text-dim">현재 선택</small>
                <strong className="text-sm">{selectedChampion?.nameKo ?? "선택 없음"}</strong>
              </p>
            </div>
            <button type="button" disabled={!selectedChampion} className="h-10 bg-gold px-6 text-xs font-bold text-bg disabled:cursor-not-allowed disabled:opacity-40">
              선택 확정 <span className="ml-3">↵</span>
            </button>
          </footer>
        </section>

        <DraftRail side="RED" teamName="협곡의 지배자" picks={RED_PICKS} lockedChampions={RED_LOCKED} activePickIndex={getActivePickIndex("RED")} />
      </section>

      <footer className="tabular flex h-[34px] shrink-0 items-center justify-between border-t border-line bg-surface px-6 text-[8px] tracking-[0.12em] text-dim">
        <span className="flex items-center gap-2"><i className="size-1.5 rounded-full bg-red" /> LIVE DRAFT</span>
        <span>3번째 세션 · 2번째 매치 · 관전자 14명</span>
        <span>한타대학교 정기 내전</span>
      </footer>
    </main>
  );
}

function TeamHeader({ side, teamName, score }: { side: Side; teamName: string; score: number }) {
  const isBlue = side === "BLUE";
  return (
    <section className={`flex items-center justify-between border-t-[3px] px-8 ${isBlue ? "border-blue" : "border-red"}`}>
      {isBlue ? (
        <>
          <TeamIdentity side={side} teamName={teamName} />
          <strong className="tabular text-4xl">{score}</strong>
        </>
      ) : (
        <>
          <strong className="tabular text-4xl">{score}</strong>
          <TeamIdentity side={side} teamName={teamName} reverse />
        </>
      )}
    </section>
  );
}

function TeamIdentity({ side, teamName, reverse = false }: { side: Side; teamName: string; reverse?: boolean }) {
  const sideClass = side === "BLUE" ? "border-blue text-blue" : "border-red text-red";
  const badge = <span className={`tabular grid h-10 min-w-14 place-items-center border px-2 text-[10px] font-semibold ${sideClass}`}>{side}</span>;
  const name = <div className={reverse ? "text-right" : ""}><strong className="block text-base">{teamName}</strong><small className={`text-[9px] tracking-[0.2em] ${side === "BLUE" ? "text-blue" : "text-red"}`}>{side} SIDE</small></div>;
  return <div className="flex items-center gap-3">{reverse ? <>{name}{badge}</> : <>{badge}{name}</>}</div>;
}

function Timer({ side, reserve }: { side: Side; reserve: string }) {
  return (
    <div className="flex items-center justify-between px-10">
      <span className={`text-[10px] tracking-[0.15em] ${side === "BLUE" ? "text-blue" : "text-red"}`}>{side} TURN</span>
      <div className="text-right">
        <strong className="tabular block text-2xl">0:24</strong>
        <small className="tabular text-[8px] text-dim">RESERVE {reserve}</small>
      </div>
    </div>
  );
}
