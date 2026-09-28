"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { NavBar } from "@/components/layout/NavBar";
import { Card } from "@/components/ui/Card";
import { LaneIcon } from "@/components/ui/LaneIcon";
import { championSquareUrl } from "@/lib/champion-art";
import { isStandardChampion } from "@/lib/champion-catalog";
import { fetchGlobalChampionAnalytics } from "@/lib/api/champions";
import { LANES, LANE_LABEL_KO } from "@/lib/constants";
import type { ChampionAnalyticsResponse, Lane, MatchChampionSummary } from "@/types";

type LaneFilter = Lane | "ALL";
type SortKey = "PICK_RATE" | "WIN_RATE" | "KDA";
type SortDirection = "asc" | "desc";

interface ChampionPerformance {
  champion: MatchChampionSummary;
  picks: number;
  wins: number;
  kdaSum: number;
  kdaSamples: number;
  totalMatches: number;
  laneCounts: Record<Lane, number>;
}

export default function ChampionAnalyticsPage() {
  const [analytics, setAnalytics] = useState<ChampionAnalyticsResponse | null>(null);
  const [lane, setLane] = useState<LaneFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("WIN_RATE");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchGlobalChampionAnalytics()
      .then((response) => {
        if (!active) return;
        setAnalytics(response);
        setError(null);
      })
      .catch((caught) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "챔피언 전적을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => {
    if (!analytics) return [];
    const grouped = new Map<number, ChampionPerformance>();

    for (const source of analytics.rows) {
      if (!isStandardChampion(source.champion) || (lane !== "ALL" && source.lane !== lane)) {
        continue;
      }
      const current = grouped.get(source.champion.id) ?? {
        champion: source.champion,
        picks: 0,
        wins: 0,
        kdaSum: 0,
        kdaSamples: 0,
        totalMatches: analytics.totalMatches,
        laneCounts: { TOP: 0, JUNGLE: 0, MID: 0, ADC: 0, SUPPORT: 0 },
      };
      current.picks += source.picks;
      current.wins += source.wins;
      current.kdaSum += source.kdaSum;
      current.kdaSamples += source.kdaSamples;
      current.laneCounts[source.lane] += source.picks;
      grouped.set(source.champion.id, current);
    }

    const direction = sortDirection === "desc" ? -1 : 1;
    return [...grouped.values()].sort((left, right) => {
      const difference = sortValue(left, sortKey) - sortValue(right, sortKey);
      if (difference !== 0) return difference * direction;
      return right.picks - left.picks || left.champion.nameKo.localeCompare(right.champion.nameKo, "ko");
    });
  }, [analytics, lane, sortDirection, sortKey]);

  const honeyChampionIds = useMemo(() => {
    if (rows.length === 0) return new Set<number>();
    const count = Math.max(1, Math.ceil(rows.length * 0.04));
    return new Set(
      [...rows]
        .sort((left, right) => winRate(right) - winRate(left) || right.picks - left.picks)
        .slice(0, count)
        .map((row) => row.champion.id),
    );
  }, [rows]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }
    setSortKey(key);
    setSortDirection("desc");
  }

  return (
    <div className="min-h-dvh bg-bg">
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="section-label mb-2">전적 통계</p>
          <h1 className="text-xl font-semibold tracking-tight">챔피언 분석</h1>
          <p className="mt-3 text-base text-muted">
            서비스의 모든 완료 내전과 입력된 KDA를 합산한 공용 통계입니다.
          </p>
        </div>

        <Card className="mb-5 p-3">
          <div className="flex flex-wrap gap-2">
            {(["ALL", ...LANES] as LaneFilter[]).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={lane === item}
                onClick={() => setLane(item)}
                className={`flex h-10 items-center gap-2 rounded-md border px-4 text-sm transition-colors ${
                  lane === item
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-line bg-bg text-muted hover:border-dim hover:text-text"
                }`}
              >
                {item !== "ALL" && <LaneIcon lane={item} size={20} />}
                {item === "ALL" ? "전체" : LANE_LABEL_KO[item]}
              </button>
            ))}
          </div>
        </Card>

        {error && <p className="mb-5 rounded-lg border border-loss/40 bg-loss/10 p-4 text-loss">{error}</p>}
        {loading ? (
          <Card className="p-12 text-center text-muted">전체 내전 전적을 집계하는 중입니다.</Card>
        ) : error ? null : rows.length === 0 ? (
          <Card className="p-12 text-center text-muted">이 조건으로 완료된 챔피언 전적이 없습니다.</Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[760px]">
                <div className="grid grid-cols-[68px_minmax(220px,1fr)_100px_130px_130px_130px] items-center border-b border-line bg-raised/60 px-4 py-3 text-sm text-muted">
                  <span>순위</span>
                  <span>챔피언</span>
                  <span>주 라인</span>
                  <SortHeader label="픽률" sortKey="PICK_RATE" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                  <SortHeader label="승률" sortKey="WIN_RATE" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                  <SortHeader label="평균 KDA" sortKey="KDA" activeKey={sortKey} direction={sortDirection} onSort={toggleSort} />
                </div>
                <ol>
                  {rows.map((row, index) => (
                    <ChampionRow
                      key={row.champion.id}
                      row={row}
                      rank={index + 1}
                      honey={honeyChampionIds.has(row.champion.id)}
                    />
                  ))}
                </ol>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === activeKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`justify-self-end rounded px-2 py-1 transition-colors hover:bg-bg hover:text-text ${active ? "font-semibold text-gold" : ""}`}
    >
      {label} <span aria-hidden="true">{active ? (direction === "desc" ? "↓" : "↑") : "↕"}</span>
    </button>
  );
}

function ChampionRow({ row, rank, honey }: { row: ChampionPerformance; rank: number; honey: boolean }) {
  const primaryLane = LANES.reduce<Lane>(
    (best, candidate) => row.laneCounts[candidate] > row.laneCounts[best] ? candidate : best,
    LANES[0],
  );
  return (
    <li className="grid min-h-16 grid-cols-[68px_minmax(220px,1fr)_100px_130px_130px_130px] items-center border-b border-line-soft px-4 py-2.5 last:border-b-0 hover:bg-raised/35">
      <span className="tabular text-sm text-muted">{rank}</span>
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-md border border-line-soft bg-bg">
          <Image
            src={championSquareUrl(row.champion.riotId, row.champion.imageUrl)}
            alt={row.champion.nameKo}
            fill
            sizes="44px"
            className="object-cover"
          />
          {honey && (
            <span
              className="absolute bottom-0 left-0 grid size-[22px] place-items-center p-0.5"
              title="승률 상위 4%"
            >
              <Image
                src="/riot/honeybee.png"
                alt=""
                width={20}
                height={20}
                className="size-5 object-contain"
              />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <strong className="block truncate text-base">{row.champion.nameKo}</strong>
          <span className="text-sm text-muted">{row.picks}회 선택</span>
        </div>
      </div>
      <span title={LANE_LABEL_KO[primaryLane]}><LaneIcon lane={primaryLane} size={26} /></span>
      <span className="tabular justify-self-end text-sm">{pickRate(row).toFixed(1)}%</span>
      <span className="tabular justify-self-end text-sm">{winRate(row).toFixed(1)}%</span>
      <span className="tabular justify-self-end text-sm">{row.kdaSamples ? averageKda(row).toFixed(2) : "-"}</span>
    </li>
  );
}

function pickRate(row: ChampionPerformance) {
  return row.totalMatches ? (row.picks / row.totalMatches) * 100 : 0;
}

function winRate(row: ChampionPerformance) {
  return row.picks ? (row.wins / row.picks) * 100 : 0;
}

function averageKda(row: ChampionPerformance) {
  return row.kdaSamples ? row.kdaSum / row.kdaSamples : 0;
}

function sortValue(row: ChampionPerformance, key: SortKey) {
  if (key === "PICK_RATE") return pickRate(row);
  if (key === "WIN_RATE") return winRate(row);
  return row.kdaSamples ? averageKda(row) : -1;
}
