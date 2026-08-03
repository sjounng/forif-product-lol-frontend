import { apiFetch } from "@/lib/api/client";
import type {
  MatchOverview,
  MatchParticipantStats,
  MatchStartRequest,
  SessionMatch,
  Side,
} from "@/types";

export function fetchMatchOverview(sessionId: number): Promise<MatchOverview> {
  return apiFetch<MatchOverview>(`/api/sessions/${sessionId}/matches`);
}

export function requestMatchStart(
  sessionId: number,
  blueTeamSide: Side,
): Promise<MatchStartRequest> {
  return apiFetch<MatchStartRequest>(
    `/api/sessions/${sessionId}/match-start-requests`,
    {
      method: "POST",
      body: JSON.stringify({ blueTeamSide }),
    },
  );
}

export function respondToMatchStart(
  requestId: number,
  response: "accept" | "reject" | "cancel",
): Promise<SessionMatch | MatchStartRequest> {
  return apiFetch<SessionMatch | MatchStartRequest>(
    `/api/match-start-requests/${requestId}/${response}`,
    { method: "POST" },
  );
}

export function startMatch(matchId: number): Promise<SessionMatch> {
  return apiFetch<SessionMatch>(`/api/matches/${matchId}/start`, {
    method: "POST",
  });
}

export function proposeMatchResult(
  matchId: number,
  winnerSide: Side,
  participantStats: MatchParticipantStats[],
  riotMatchId?: string,
): Promise<SessionMatch> {
  return apiFetch<SessionMatch>(`/api/matches/${matchId}/results`, {
    method: "POST",
    body: JSON.stringify({
      winnerSide,
      riotMatchId: riotMatchId || null,
      participantStats,
    }),
  });
}

export function respondToMatchResult(
  matchId: number,
  response: "accept" | "reject",
): Promise<SessionMatch> {
  return apiFetch<SessionMatch>(
    `/api/matches/${matchId}/results/${response}`,
    { method: "POST" },
  );
}

export function finishUnlimitedSession(
  sessionId: number,
): Promise<MatchOverview> {
  return apiFetch<MatchOverview>(`/api/sessions/${sessionId}/finish`, {
    method: "POST",
  });
}
