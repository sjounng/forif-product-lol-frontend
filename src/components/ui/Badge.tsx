import type { ReactNode } from "react";

/**
 * 코드·진영 표기 전용 (공개 코드 LTVJPMX9, BLUE/RED).
 * 채움 없이 얇은 테두리만 둔 각진 키캡 — 상태·역할 같은 정보에는 쓰지 않는다.
 * 상태는 StatusTag, 그 외 정보는 그냥 작은 글자로 쓴다.
 */
type Tone = "neutral" | "blue" | "red";

const TONE: Record<Tone, string> = {
  neutral: "border-line text-muted",
  blue: "border-blue/50 text-blue",
  red: "border-red/50 text-red",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center border px-1.5 font-mono text-[11px] leading-5 tracking-wider ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}
