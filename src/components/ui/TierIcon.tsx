import Image from "next/image";
import type { Tier } from "@/types";

const TIER_ICON_SRC: Record<Exclude<Tier, "UNRANKED">, string> = {
  IRON: "/riot/ranked-emblems/Rank=Iron.png",
  BRONZE: "/riot/ranked-emblems/Rank=Bronze.png",
  SILVER: "/riot/ranked-emblems/Rank=Silver.png",
  GOLD: "/riot/ranked-emblems/Rank=Gold.png",
  PLATINUM: "/riot/ranked-emblems/Rank=Platinum.png",
  EMERALD: "/riot/ranked-emblems/Rank=Emerald.png",
  DIAMOND: "/riot/ranked-emblems/Rank=Diamond.png",
  MASTER: "/riot/ranked-emblems/Rank=Master.png",
  GRANDMASTER: "/riot/ranked-emblems/Rank=Grandmaster.png",
  CHALLENGER: "/riot/ranked-emblems/Rank=Challenger.png",
};

export function TierIcon({
  tier,
  size = 52,
  className = "",
}: {
  tier: Tier;
  size?: number;
  className?: string;
}) {
  const unranked = tier === "UNRANKED";
  const src = unranked ? TIER_ICON_SRC.IRON : TIER_ICON_SRC[tier];
  return (
    <Image
      src={src}
      alt={unranked ? "언랭크" : `${tier} 티어`}
      width={size}
      height={size}
      className={`shrink-0 object-contain ${unranked ? "grayscale opacity-45" : ""} ${className}`}
    />
  );
}
