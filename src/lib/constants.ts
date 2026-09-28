import type { FearlessMode, Lane, MatchFormat, SessionStatus, Tier } from "@/types";

export const LANES: Lane[] = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

/** 표에서 세로로 정렬되도록 라인 이름을 짧은 영문으로 통일한다. */
export const LANE_LABEL: Record<Lane | "FILL", string> = {
  TOP: "TOP",
  JUNGLE: "JGL",
  MID: "MID",
  ADC: "ADC",
  SUPPORT: "SUP",
  FILL: "ANY",
};

export const LANE_LABEL_KO: Record<Lane | "FILL", string> = {
  TOP: "탑",
  JUNGLE: "정글",
  MID: "미드",
  ADC: "원딜",
  SUPPORT: "서폿",
  FILL: "상관없음",
};

export const TIER_LABEL: Record<Tier, string> = {
  UNRANKED: "언랭",
  IRON: "아이언",
  BRONZE: "브론즈",
  SILVER: "실버",
  GOLD: "골드",
  PLATINUM: "플래티넘",
  EMERALD: "에메랄드",
  DIAMOND: "다이아",
  MASTER: "마스터",
  GRANDMASTER: "그랜드마스터",
  CHALLENGER: "챌린저",
};

export const FEARLESS_LABEL: Record<FearlessMode, string> = {
  NONE: "피어리스 사용 안 함",
  GLOBAL_FEARLESS: "글로벌 피어리스",
  HARD_FEARLESS: "하드 피어리스",
};

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  PREPARING: "준비 중",
  PROPOSED: "수락 대기",
  CONFIRMED: "확정",
  IN_PROGRESS: "진행 중",
  FINISHED: "종료",
  CANCELLED: "취소",
};

export const MATCH_FORMAT_LABEL: Record<MatchFormat, string> = {
  BEST_OF_3: "3판 2선승",
  BEST_OF_5: "5판 3선승",
  UNLIMITED: "제한 없음",
};
