/**
 * 도메인 타입. `schema.sql` / `DESIGN.md` 를 그대로 반영한다.
 * 백엔드 응답 필드명이 바뀌면 여기부터 고친다.
 */

export type Lane = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT";
export type LanePreference = Lane | "FILL";
export type Side = "BLUE" | "RED";
export type GroupRole = "GROUP_OWNER" | "GROUP_MANAGER" | "GROUP_MEMBER";
export type CaptainInvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED";

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
  | "GLOBAL_FEARLESS"
  | "HARD_FEARLESS";

export type MatchFormat = "BEST_OF_3" | "BEST_OF_5" | "UNLIMITED";
export type SessionStatus =
  | "PREPARING"
  | "PROPOSED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "FINISHED"
  | "CANCELLED";
export type ParticipantType = "MEMBER" | "GUEST" | "PLAYER";
export type MatchStatus =
  | "SCHEDULED"
  | "PROPOSED"
  | "ACCEPTED"
  | "DRAFTING"
  | "READY_TO_PLAY"
  | "LIVE"
  | "RESULT_PENDING"
  | "RESULT_DISPUTED"
  | "COMPLETED"
  | "CANCELLED"
  | "VOIDED";
export type MatchStartRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED";
export type DraftStatus =
  | "WAITING"
  | "READY"
  | "IN_PROGRESS"
  | "ASSIGNING"
  | "PAUSED"
  | "TECHNICAL_PAUSED"
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
  guestAdmissionEnabled: boolean;
  entryPasswordProtected: boolean;
  participantCount: number;
  sessionCount: number;
  matchCount: number;
  status: "ACTIVE" | "ARCHIVED";
  owner: GroupUser;
  opponentCaptain: GroupUser | null;
  captainInvitationStatus: CaptainInvitationStatus | null;
  myRole: GroupRole;
  createdAt: string;
}

export interface GroupUser {
  id: number;
  displayName: string;
  avatarUrl: string | null;
}

export interface CaptainInvitation {
  id: number;
  roomId: number;
  roomName: string;
  inviter: GroupUser;
  invitee: GroupUser;
  status: CaptainInvitationStatus;
  expiresAt: string;
  createdAt: string;
}

export interface RoomMember {
  membershipId: number;
  user: GroupUser;
  role: GroupRole;
  joinedAt: string;
  player: Player | null;
}

export interface GroupGuest {
  id: number;
  nickname: string;
  active: boolean;
  banned: boolean;
  joinedAt: string;
}

export interface PublicRoom {
  id: number;
  name: string;
  description: string | null;
  publicCode: string;
  guestAdmissionEnabled: boolean;
  entryPasswordProtected: boolean;
  participantCount: number;
}

export interface GuestEntry {
  room: PublicRoom;
  guest: GroupGuest;
}

export interface RiotAccount {
  gameName: string;
  tagLine: string;
  tier: Tier;
  division: Division | null;
  leaguePoints: number;
  wins?: number;
  losses?: number;
  ladderScore?: number;
  syncedAt?: string | null;
}

export interface Player {
  id: number;
  memberUserId?: number | null;
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
  roomId: number;
  name: string | null;
  matchFormat: MatchFormat;
  fearlessMode: FearlessMode;
  status: SessionStatus;
  ratingEnabled: boolean;
  gameCount: number;
  rejectionReason: string | null;
  proposedAt: string | null;
  confirmedAt: string | null;
  createdAt: string;
  teams: SessionTeam[];
  viewer: SessionViewer;
}

export interface SessionTeam {
  side: Side;
  teamName: string;
  captain: GroupUser;
  members: FixedSessionMember[];
}

export interface FixedSessionMember {
  playerId: number;
  participantType: ParticipantType;
  participantId: number;
  displayName: string;
  lane: Lane;
  primaryLane: Lane | null;
  secondaryLane: Lane | null;
}

export interface UserProfile {
  user: User;
  riotAccount: RiotAccount | null;
  primaryLane: Lane | null;
  secondaryLane: Lane | null;
}

export interface SessionViewer {
  captainSide: Side | null;
  canReview: boolean;
  canCancel: boolean;
  canCreateMatch: boolean;
}

export interface MatchStartRequest {
  id: number;
  sessionId: number;
  gameNo: number;
  proposedBy: GroupUser;
  /** 이번 매치에서 세션 BLUE 팀이 배정받은 실제 진영 */
  blueTeamSide: Side;
  blueTeamName: string;
  redTeamName: string;
  status: MatchStartRequestStatus;
  createdAt: string;
  canReview: boolean;
  canCancel: boolean;
}

export interface SessionMatch {
  id: number;
  sessionId: number;
  gameNo: number;
  status: MatchStatus;
  /** 이번 매치에서 세션 BLUE 팀이 배정받은 실제 진영 */
  blueTeamSide: Side;
  /** 이번 매치의 실제 BLUE/RED 진영에 배정된 팀 이름 */
  blueTeamName: string;
  redTeamName: string;
  winnerSide: Side | null;
  proposedWinnerSide: Side | null;
  resultProposedByUserId: number | null;
  riotMatchId: string | null;
  draftId: number | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  participants: MatchParticipant[];
  draftActions: MatchDraftAction[];
  canProposeResult: boolean;
  canReviewResult: boolean;
}

export interface MatchChampionSummary {
  id: number;
  riotId: string;
  nameKo: string;
  imageUrl: string | null;
}

export interface MatchDraftAction {
  stepNo: number;
  side: Side;
  actionType: "BAN" | "PICK";
  champion: MatchChampionSummary | null;
  playerId: number | null;
  auto: boolean;
}

export interface MatchParticipant {
  playerId: number;
  displayName: string;
  side: Side;
  lane: Lane;
  champion: MatchChampionSummary | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
}

export interface MatchParticipantStats {
  playerId: number;
  kills: number;
  deaths: number;
  assists: number;
}

export interface MatchOverview {
  sessionId: number;
  score: {
    blueWins: number;
    redWins: number;
  };
  pendingStartRequest: MatchStartRequest | null;
  matches: SessionMatch[];
  canRequestStart: boolean;
  canFinishSession: boolean;
}

export interface Champion {
  id: number;
  riotId: string;
  nameKo: string;
  imageUrl: string | null;
  nameEn?: string;
  tags?: string[];
  ddragonVersion?: string;
}

export interface DraftStep {
  stepNo: number;
  side: Side;
  actionType: "BAN" | "PICK";
  phase: number;
  champion: DraftChampionSummary | null;
  playerId: number | null;
  auto: boolean;
  lockedAt: string | null;
}

export interface DraftChampionSummary {
  id: number;
  riotId: string;
  nameKo: string;
  imageUrl: string | null;
}

export interface DraftPlayer {
  playerId: number;
  displayName: string;
  lane: Lane;
}

export interface DraftTeam {
  side: Side;
  teamName: string;
  captainUserId: number;
  captainDisplayName: string;
  ready: boolean;
  players: DraftPlayer[];
}

export type LockedChampionSource =
  | "CURRENT_BAN"
  | "CURRENT_PICK"
  | "PREVIOUS_MATCH_BAN"
  | "PREVIOUS_MATCH_PICK";

export interface DraftLockedChampion {
  champion: DraftChampionSummary;
  source: LockedChampionSource;
  sourceMatchId: number | null;
  side: Side | null;
}

export interface DraftAssignment {
  side: Side;
  playerId: number;
  playerDisplayName: string;
  lane: Lane;
  champion: DraftChampionSummary;
  auto: boolean;
}

export interface DraftHover {
  side: Side;
  stepNo: number;
  champion: DraftChampionSummary | null;
  updatedAt: string;
}

export interface DraftViewer {
  role:
    | "BLUE_CAPTAIN"
    | "RED_CAPTAIN"
    | "SESSION_PLAYER"
    | "GROUP_OWNER"
    | "GROUP_MANAGER"
    | "GROUP_MEMBER"
    | "SPECTATOR";
  side: Side | null;
  canReady: boolean;
  canLock: boolean;
  canAssign: boolean;
  canConfirmAssignment: boolean;
}

export interface DraftState {
  draftId: number;
  version: number;
  lastEventSeq: number;
  serverTime: string;
  status: DraftStatus;
  session: {
    id: number;
    name: string | null;
    gameNo: number;
    fearlessMode: FearlessMode;
  };
  teams: Record<Side, DraftTeam>;
  steps: DraftStep[];
  currentStep: number;
  hover: DraftHover | null;
  turnDeadlineAt: string | null;
  assignmentDeadlineAt: string | null;
  blueReserveMs: number;
  redReserveMs: number;
  lockedChampions: DraftLockedChampion[];
  bannedByFearless: number[];
  assignments: DraftAssignment[];
  assignmentConfirmed: Record<Side, boolean>;
  viewer: DraftViewer;
}

export interface DraftRealtimeEvent<TPayload = unknown> {
  draftId: number;
  seq: number;
  version: number;
  type:
    | "SNAPSHOT"
    | "READY_UPDATED"
    | "HOVER_UPDATED"
    | "ACTION_LOCKED"
    | "TURN_STARTED"
    | "ASSIGNMENT_UPDATED"
    | "ASSIGNMENT_CONFIRMED"
    | "ASSIGNMENT_AUTO_COMPLETED"
    | "DRAFT_COMPLETED"
    | "ERROR";
  payload: TPayload;
}
