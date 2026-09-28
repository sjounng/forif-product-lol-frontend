"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { LanePreferenceIcons } from "@/components/ui/LaneIcon";
import { PageHeader } from "@/components/ui/PageHeader";
import { fetchPlayers } from "@/lib/api/players";
import type { Player } from "@/types";

const COLUMNS = "grid-cols-[68px_minmax(200px,1fr)_140px_120px]";

export default function LeaderboardPage() {
  const params = useParams<{ roomId: string }>();
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchPlayers(Number(params.roomId))
      .then(setPlayers)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "랭킹을 불러오지 못했습니다."));
  }, [params.roomId]);

  // 순위는 그룹 레이팅 기준이다 — 솔랭은 첫 판 시드로만 쓰이고 이후엔 내전 결과로만 움직인다
  const sorted = useMemo(
    () => (players ? [...players].sort((a, b) => b.rating - a.rating) : []),
    [players],
  );

  return (
    <main className="px-8 py-8">
      <PageHeader title="그룹 레이팅" />
      {error && <p role="alert" className="mb-5 text-sm text-loss">{error}</p>}
      {players === null ? (
        !error && <p className="text-sm text-muted">불러오는 중…</p>
      ) : sorted.length === 0 ? (
        <Card className="px-5 py-10 text-center text-sm text-muted">등록된 참가자가 없습니다.</Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className={`grid ${COLUMNS} items-center border-b border-line bg-raised/60 px-4 py-3 text-sm text-muted`}>
                <span>순위</span>
                <span>이름</span>
                <span className="text-right">전적</span>
                <span className="text-right">레이팅</span>
              </div>
              <ol>
                {sorted.map((player, index) => (
                  <li
                    key={player.id}
                    className={`grid ${COLUMNS} items-center border-b border-line-soft px-4 py-3 last:border-0`}
                  >
                    <span className="tabular text-sm text-gold">{index + 1}</span>
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm">{player.displayName}</span>
                      <LanePreferenceIcons
                        primary={player.primaryLane === "FILL" ? null : player.primaryLane}
                        secondary={player.secondaryLane === "FILL" ? null : player.secondaryLane}
                      />
                    </div>
                    <span className="tabular text-right text-sm text-muted">
                      {player.gamesPlayed ? `${player.wins}승 ${player.losses}패` : "—"}
                    </span>
                    <span className="tabular text-right text-sm text-gold">
                      {player.rating.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Card>
      )}
    </main>
  );
}
