import Image from "next/image";
import { LANE_LABEL_KO } from "@/lib/constants";
import type { Lane } from "@/types";

const LANE_ICON_SRC: Record<Lane, string> = {
  TOP: "/riot/positions/Position_Challenger-Top.png",
  JUNGLE: "/riot/positions/Position_Challenger-Jungle.png",
  MID: "/riot/positions/Position_Challenger-Mid.png",
  ADC: "/riot/positions/Position_Challenger-Bot.png",
  SUPPORT: "/riot/positions/Position_Challenger-Support.png",
};

export function LaneIcon({
  lane,
  size = 24,
  className = "",
}: {
  lane: Lane;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={LANE_ICON_SRC[lane]}
      alt={LANE_LABEL_KO[lane]}
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

export function LanePreferenceIcons({
  primary,
  secondary,
  showLabels = false,
}: {
  primary: Lane | null;
  secondary: Lane | null;
  showLabels?: boolean;
}) {
  if (!primary && !secondary) return null;
  const title = [
    primary && `주 라인 ${LANE_LABEL_KO[primary]}`,
    secondary && `부 라인 ${LANE_LABEL_KO[secondary]}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <span className="inline-flex items-end gap-1.5" title={title}>
      {primary && (
        <span className="inline-flex items-center gap-1 text-gold">
          <LaneIcon lane={primary} size={30} />
          {showLabels && (
            <span className="text-xs font-medium">{LANE_LABEL_KO[primary]}</span>
          )}
        </span>
      )}
      {secondary && (
        <span className="inline-flex items-center gap-1 text-muted opacity-55">
          <LaneIcon lane={secondary} size={22} />
          {showLabels && (
            <span className="text-[11px]">{LANE_LABEL_KO[secondary]}</span>
          )}
        </span>
      )}
    </span>
  );
}
