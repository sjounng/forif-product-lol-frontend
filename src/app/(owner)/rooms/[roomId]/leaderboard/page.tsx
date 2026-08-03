"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRoom } from "@/components/group/RoomShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LanePreferenceIcons } from "@/components/ui/LaneIcon";
import { TierIcon } from "@/components/ui/TierIcon";
import { fetchPlayers, syncPlayers } from "@/lib/api/players";
import { formatRank } from "@/lib/format";
import type { Player } from "@/types";

type SortKey = "rank" | "solo" | "winRate" | "rating";

function soloWinRate(player: Player) {
  const wins = player.riotAccount?.wins ?? 0;
  const games = wins + (player.riotAccount?.losses ?? 0);
  return games ? wins / games : 0;
}

export default function LeaderboardPage() {
  const params = useParams<{ roomId: string }>();
  const { room } = useRoom();
  const canManage = room.myRole === "GROUP_OWNER" || room.myRole === "GROUP_MANAGER";
  const [players, setPlayers] = useState<Player[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("solo");
  const [descending, setDescending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    void fetchPlayers(Number(params.roomId)).then(setPlayers).catch((caught) => setError(caught instanceof Error ? caught.message : "랭킹을 불러오지 못했습니다."));
  }, [params.roomId]);

  const baseRank = useMemo(() => new Map([...players].sort((a, b) => (b.riotAccount?.ladderScore ?? 0) - (a.riotAccount?.ladderScore ?? 0)).map((player, index) => [player.id, index + 1])), [players]);
  const sorted = useMemo(() => [...players].sort((a, b) => {
    const value = (player: Player) => {
      if (sortKey === "rank") return baseRank.get(player.id) ?? Number.MAX_SAFE_INTEGER;
      if (sortKey === "solo") return player.riotAccount?.ladderScore ?? 0;
      if (sortKey === "winRate") return soloWinRate(player);
      return player.rating;
    };
    const difference = value(a) - value(b);
    return descending ? -difference : difference;
  }), [baseRank, descending, players, sortKey]);

  function toggle(key: SortKey) {
    if (sortKey === key) setDescending((value) => !value);
    else { setSortKey(key); setDescending(key !== "rank"); }
  }

  async function handleSync() {
    try {
      setSyncing(true);
      setError(null);
      setSyncNotice(null);
      const refreshed = await syncPlayers(room.id);
      setPlayers(refreshed);
      setSyncNotice(`${refreshed.length}명의 솔로랭크 정보를 갱신했습니다.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "솔로랭크 정보를 갱신하지 못했습니다.");
    } finally {
      setSyncing(false);
    }
  }

  const heading = (key: SortKey, label: string) => (
    <button type="button" onClick={() => toggle(key)} className="eyebrow hover:text-text">
      {label}{sortKey === key ? (descending ? " ↓" : " ↑") : ""}
    </button>
  );

  return (
    <main className="px-8 py-8">
      {canManage && (
        <div className="mb-4 flex justify-end">
          <Button size="sm" onClick={() => void handleSync()} disabled={syncing || players.length === 0}>
            {syncing ? "Riot 동기화 중…" : "솔로랭크 새로고침"}
          </Button>
        </div>
      )}
      <div className="mb-8"><p className="eyebrow mb-2">랭킹</p><h1 className="text-xl font-semibold">솔로랭크 현황</h1><p className="mt-2 text-[13px] text-muted">그룹 레이팅 계산은 개발 중이며, 현재 표의 솔로랭크 데이터는 Riot 계정 동기화 결과입니다.</p></div>
      {error && <p className="mb-5 text-sm text-loss">{error}</p>}
      {syncNotice && <p className="mb-5 text-sm text-gain">{syncNotice}</p>}
      <Card className="overflow-x-auto">
        <div className="grid min-w-[760px] grid-cols-[64px_minmax(180px,1fr)_150px_110px_90px_110px] items-center gap-3 border-b border-line px-5 py-3">
          {heading("rank", "순위")}<span className="eyebrow">이름</span>{heading("solo", "솔랭 점수")}<span className="eyebrow text-right">솔랭 전적</span><span className="text-right">{heading("winRate", "승률")}</span><span className="text-right">{heading("rating", "레이팅")}</span>
        </div>
        {sorted.length === 0 ? <p className="px-5 py-12 text-center text-sm text-muted">Riot 계정이 연동된 참가자가 없습니다.</p> : (
          <ul>{sorted.map((player) => {
            const account = player.riotAccount;
            const wins = account?.wins ?? 0;
            const losses = account?.losses ?? 0;
            return <li key={player.id} className="grid min-w-[760px] grid-cols-[64px_minmax(180px,1fr)_150px_110px_90px_110px] items-center gap-3 border-b border-line-soft px-5 py-3 last:border-0">
              <span className="tabular text-sm text-gold">{baseRank.get(player.id)}</span>
              <div className="flex min-w-0 items-center gap-2"><span className="truncate text-sm">{player.displayName}</span><LanePreferenceIcons primary={player.primaryLane === "FILL" ? null : player.primaryLane} secondary={player.secondaryLane === "FILL" ? null : player.secondaryLane} /></div>
              <div className="flex items-center gap-2">
                <TierIcon tier={account?.tier ?? "UNRANKED"} size={48} />
                <div>
                  <p className="text-sm">{formatRank(account)}</p>
                  <p className="tabular mt-0.5 text-xs text-dim">{(account?.ladderScore ?? 0).toLocaleString()}점</p>
                </div>
              </div>
              <span className="tabular text-right text-sm text-muted">{wins}승 {losses}패</span>
              <span className="tabular text-right text-sm text-muted">{wins + losses ? `${(soloWinRate(player) * 100).toFixed(1)}%` : "-"}</span>
              <span className="text-right text-xs text-dim" title="레이팅 계산식 연동 예정">개발 중</span>
            </li>;
          })}</ul>
        )}
      </Card>
    </main>
  );
}
