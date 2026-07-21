/**
 * 도메인 타입. `schema.sql` / `DESIGN.md` 를 그대로 반영한다.
 * 백엔드 응답 필드명이 바뀌면 여기부터 고친다.
 */

export type Lane = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT";
export type LanePreference = Lane | "FILL";
export type Side = "BLUE" | "RED";

export type Tier =
  | "UNRANKED"
  | "IRON"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "EMERALD"
  | "DIAMOND"
  | "MASTER"
  | "GRANDMASTER"
  | "CHALLENGER";

export type Division = "I" | "II" | "III" | "IV";

/** 라인이 주라인이었는지 — 오프롤 점수 보호 계수의 근거 (DESIGN §4.3) */
export type AssignedFrom = "PRIMARY" | "SECONDARY" | "OFF_ROLE" | "FILL";

export type FearlessMode =
  | "NONE"
  | "FEARLESS"
  | "GLOBAL_FEARLESS"
  | "HARD_FEARLESS";

export type SessionStatus = "OPEN" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
export type SessionPlayerStatus =
  | "ROSTERED"
  | "BENCHED"
  | "PLAYING"
  | "WITHDRAWN";
export type MatchStatus =
  | "SCHEDULED"
  | "DRAFTING"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "VOIDED";
export type DraftStatus =
  | "WAITING"
  | "READY"
  | "IN_PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "ABORTED";

export interface User {
  id: number;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Room {
  id: number;
  name: string;
  description: string | null;
  publicCode: string;
  guestCanDraft: boolean;
  playerCount: number;
  sessionCount: number;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
}

export interface RiotAccount {
  gameName: string;
  tagLine: string;
  tier: Tier;
  division: Division | null;
  leaguePoints: number;
}

export interface Player {
  id: number;
  displayName: string;
  riotAccount: RiotAccount | null;
  /** 방 단위 누적 점수. riot 계정이 아니라 player 에 붙는다 */
  rating: number;
  /** 불확실성. 클수록 K가 커진다 */
  rd: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  primaryLane: LanePreference | null;
  secondaryLane: LanePreference | null;
  /** 라인별 가능도 0~5. 0 = 배정 금지 */
  lanePool: Partial<Record<Lane, number>>;
  isActive: boolean;
}

export interface ScrimSession {
  id: number;
  name: string | null;
  fearlessMode: FearlessMode;
  status: SessionStatus;
  ratingEnabled: boolean;
  gameCount: number;
  playerCount: number;
  createdAt: string;
}

/** 세션 참가자 + 로테이션 카운터 (DESIGN §4-A) */
export interface SessionPlayer {
  playerId: number;
  displayName: string;
  status: SessionPlayerStatus;
  rating: number;
  gamesPlayed: number;
  gamesBenched: number;
  lastPlayedGameNo: number | null;
  primaryLane: LanePreference | null;
}

/** 팀 구성 후보 1건 */
export interface BalanceCandidate {
  id: number;
  rankNo: number;
  cost: number;
  totalDiff: number;
  maxLaneDiff: number;
  offRoleCount: number;
  predictedBlueWinrate: number;
  assignment: BalanceAssignment[];
}

export interface BalanceAssignment {
  playerId: number;
  displayName: string;
  side: Side;
  lane: Lane;
  /** 팀 구성에 실제로 쓰인 점수 (오프롤이면 깎인 값) */
  effRating: number;
  assignedFrom: AssignedFrom;
}

export interface Match {
  id: number;
  gameNo: number;
  status: MatchStatus;
  winnerSide: Side | null;
  blueTotal: number;
  redTotal: number;
  durationSec: number | null;
  endedAt: string | null;
}

export interface Champion {
  id: number;
  riotId: string;
  nameKo: string;
  imageUrl: string | null;
}

export interface DraftStep {
  stepNo: number;
  side: Side;
  actionType: "BAN" | "PICK";
  championId: number | null;
}
