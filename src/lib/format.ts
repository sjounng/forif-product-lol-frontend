import { TIER_LABEL } from "@/lib/constants";
import type { RiotAccount, Tier } from "@/types";

/** "골드 II 32LP" — 마스터 이상은 디비전이 없다 */
export function formatRank(account: RiotAccount | null): string {
  if (!account || account.tier === "UNRANKED") return "언랭";
  const tier = TIER_LABEL[account.tier];
  const division = account.division ? ` ${account.division}` : "";
  return `${tier}${division} ${account.leaguePoints}LP`;
}

export function formatRiotId(account: RiotAccount | null): string {
  return account ? `${account.gameName}#${account.tagLine}` : "미등록";
}

export function formatWinRate(wins: number, games: number): string {
  if (games === 0) return "—";
  return `${Math.round((wins / games) * 100)}%`;
}

/** 점수 증감은 부호를 항상 붙인다. "+18" / "-12" */
export function formatDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : String(delta);
}

/** RD가 클수록 점수를 아직 믿을 수 없다 (DESIGN §4.2) */
export function ratingConfidence(rd: number): "낮음" | "보통" | "높음" {
  if (rd >= 250) return "낮음";
  if (rd >= 120) return "보통";
  return "높음";
}

export const TIER_COLOR: Record<Tier, string> = {
  UNRANKED: "text-dim",
  IRON: "text-[#7a7168]",
  BRONZE: "text-[#a2705a]",
  SILVER: "text-[#9aa8b5]",
  GOLD: "text-[#d7a441]",
  PLATINUM: "text-[#4fc3b0]",
  EMERALD: "text-[#3fb56b]",
  DIAMOND: "text-[#6fa8ff]",
  MASTER: "text-[#c07adb]",
  GRANDMASTER: "text-[#e0605f]",
  CHALLENGER: "text-[#61d3f5]",
};
