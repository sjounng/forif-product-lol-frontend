import { TIER_LABEL } from "@/lib/constants";
import type { RiotAccount } from "@/types";

/** "골드 II 32LP" — 마스터 이상은 디비전이 없다 */
export function formatRank(account: RiotAccount | null): string {
  if (!account || account.tier === "UNRANKED") return "언랭";
  const tier = TIER_LABEL[account.tier];
  const division = account.division ? ` ${account.division}` : "";
  return `${tier}${division} ${account.leaguePoints}LP`;
}
