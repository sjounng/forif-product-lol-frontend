import type { ReactNode } from "react";

type Tone = "neutral" | "gold" | "blue" | "red" | "gain" | "quiet";

const TONE: Record<Tone, string> = {
  neutral: "border-line bg-raised text-muted",
  gold: "border-gold/30 bg-gold/10 text-gold",
  blue: "border-blue/30 bg-blue/10 text-blue",
  red: "border-red/30 bg-red/10 text-red",
  gain: "border-gain/30 bg-gain/10 text-gain",
  quiet: "border-transparent bg-transparent text-dim",
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
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px] leading-4 ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}
