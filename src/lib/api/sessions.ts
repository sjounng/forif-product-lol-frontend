import { apiFetch } from "@/lib/api/client";
import type {
  FearlessMode,
  Lane,
  MatchFormat,
  ParticipantType,
  ScrimSession,
  Side,
} from "@/types";

export interface SessionRosterMemberInput {
  participantType: ParticipantType;
  participantId: number;
  lane: Lane;
}

export interface CreateSessionInput {
  name: string;
  matchFormat: MatchFormat;
  fearlessMode: FearlessMode;
  ratingEnabled: boolean;
  creatorSide: Side;
  opponentCaptainUserId: number;
  blueTeam: SessionRosterMemberInput[];
  redTeam: SessionRosterMemberInput[];
}

export function fetchSessions(roomId: number): Promise<ScrimSession[]> {
  return apiFetch<ScrimSession[]>(`/api/rooms/${roomId}/sessions`);
}

export function fetchSession(sessionId: number): Promise<ScrimSession> {
  return apiFetch<ScrimSession>(`/api/sessions/${sessionId}`);
}

export function createSession(
  roomId: number,
  input: CreateSessionInput,
): Promise<ScrimSession> {
  return apiFetch<ScrimSession>(`/api/rooms/${roomId}/sessions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function acceptSession(sessionId: number): Promise<ScrimSession> {
  return apiFetch<ScrimSession>(`/api/sessions/${sessionId}/accept`, {
    method: "POST",
  });
}

export function rejectSession(
  sessionId: number,
  reason: string,
): Promise<ScrimSession> {
  return apiFetch<ScrimSession>(`/api/sessions/${sessionId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export function cancelSession(sessionId: number): Promise<ScrimSession> {
  return apiFetch<ScrimSession>(`/api/sessions/${sessionId}/cancel`, {
    method: "POST",
  });
}

export function renameSessionTeam(
  sessionId: number,
  teamName: string,
): Promise<ScrimSession> {
  return apiFetch<ScrimSession>(`/api/sessions/${sessionId}/team-name`, {
    method: "PATCH",
    body: JSON.stringify({ teamName }),
  });
}
