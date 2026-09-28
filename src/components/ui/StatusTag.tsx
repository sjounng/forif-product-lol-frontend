import type { ReactNode } from "react";
import type { MatchStatus, SessionStatus } from "@/types";

/**
 * 세션·매치 상태 표기. 칩(채운 배경) 대신 헥스테크 마름모 하나 + 글자로 쓴다.
 *   live    진행 중      — 금색으로 채운 마름모
 *   waiting 합의·준비 대기 — 금색 테두리만
 *   done    끝남          — 흐린 테두리
 *   alert   분쟁          — 유일하게 붉은색
 */
export type StatusTone = "live" | "waiting" | "done" | "alert";

const MARK: Record<StatusTone, string> = {
  live: "border-gold bg-gold",
  waiting: "border-gold",
  done: "border-dim",
  alert: "border-loss bg-loss",
};

const TEXT: Record<StatusTone, string> = {
  live: "text-text",
  waiting: "text-muted",
  done: "text-dim",
  alert: "text-loss",
};

export function StatusTag({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium ${TEXT[tone]}`}>
      <span aria-hidden="true" className={`size-[7px] shrink-0 rotate-45 border ${MARK[tone]}`} />
      {children}
    </span>
  );
}

export const SESSION_STATUS_TONE: Record<SessionStatus, StatusTone> = {
  PREPARING: "waiting",
  PROPOSED: "waiting",
  CONFIRMED: "waiting",
  IN_PROGRESS: "live",
  FINISHED: "done",
  CANCELLED: "done",
};

export const MATCH_STATUS_TONE: Record<MatchStatus, StatusTone> = {
  SCHEDULED: "waiting",
  PROPOSED: "waiting",
  ACCEPTED: "waiting",
  DRAFTING: "waiting",
  READY_TO_PLAY: "waiting",
  LIVE: "live",
  RESULT_PENDING: "waiting",
  RESULT_DISPUTED: "alert",
  COMPLETED: "done",
  CANCELLED: "done",
  VOIDED: "done",
};
