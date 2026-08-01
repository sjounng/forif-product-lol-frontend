import type { FearlessMode, Lane, Tier } from "@/types";

export const LANES: Lane[] = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

/** 표에서 세로 정렬되도록 전부 3글자로 맞춘다 */
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

export const FEARLESS_DESCRIPTION: Record<FearlessMode, string> = {
  NONE: "이전 매치의 밴과 픽이 다음 매치에 영향을 주지 않습니다.",
  GLOBAL_FEARLESS: "한 번 뽑힌 챔피언은 세션 내내 아무도 못 쓴다",
  HARD_FEARLESS: "픽과 밴 모두 소진 처리한다",
};

/** 팀 구성 하드 제약 기본값 (DESIGN §5) */
export const DEFAULT_MAX_TOTAL_DIFF = 150;
export const DEFAULT_MAX_LANE_DIFF = 300;

/** 매치 인원 — UNIQUE(match_id, side, lane) 로 DB가 물리적으로 강제한다 */
export const PLAYERS_PER_MATCH = 10;
