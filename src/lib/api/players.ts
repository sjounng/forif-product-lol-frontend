import type { Player } from "@/types";
import { apiFetch } from "@/lib/api/client";

/**
 * 담당: B
 *
 * 백엔드 미구현.
 *   GET    /api/rooms/{roomId}/players
 *   POST   /api/rooms/{roomId}/players     { displayName, riotId }  ← "GameName#TAG"
 *   PATCH  /api/rooms/{roomId}/players/{playerId}   { displayName, lanePool, primaryLane }
 *   DELETE /api/rooms/{roomId}/players/{playerId}   → is_active=0 (전적은 보존)
 *   POST   /api/rooms/{roomId}/players/sync         솔랭 티어 일괄 갱신
 *
 * Riot 조회는 느리고 실패한다(개발 키 20req/s, 키 24h 만료).
 * 등록 요청은 즉시 202로 받고 sync_status 를 폴링하는 편이 낫다 — 20명 등록 = 60콜.
 * 조회 실패해도 riot_account_id=NULL 로 수동 등록이 되어야 한다.
 */

export function fetchPlayers(roomId: number): Promise<Player[]> {
  return apiFetch<Player[]>(`/api/rooms/${roomId}/players`);
}

export function addPlayer(
  roomId: number,
  input: { gameName: string; tagLine: string },
): Promise<Player> {
  return apiFetch<Player>(`/api/rooms/${roomId}/players`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function renamePlayer(roomId: number, playerId: number, displayName: string): Promise<Player> {
  return apiFetch<Player>(`/api/rooms/${roomId}/players/${playerId}`, {
    method: "PATCH",
    body: JSON.stringify({ displayName }),
  });
}

export function removePlayer(roomId: number, playerId: number): Promise<void> {
  return apiFetch<void>(`/api/rooms/${roomId}/players/${playerId}`, { method: "DELETE" });
}

export function syncPlayers(roomId: number): Promise<Player[]> {
  return apiFetch<Player[]>(`/api/rooms/${roomId}/players/sync`, {
    method: "POST",
  });
}

// TODO(B): apiFetch 로 구현
export async function updateLanePool(
  roomId: number,
  playerId: number,
  lanePool: Player["lanePool"],
): Promise<Player> {
  void roomId;
  void playerId;
  void lanePool;
  throw new Error("미구현: PATCH /api/rooms/{roomId}/players/{playerId}");
}
