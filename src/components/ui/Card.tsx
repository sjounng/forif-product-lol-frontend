import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[10px] border border-line bg-surface ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  eyebrow,
  mono = false,
  action,
}: {
  title: string;
  eyebrow?: string;
  /** 영문 기계 라벨(TEAM A, session-v1 …)일 때만 true. 한글 라벨은 기본값을 쓴다. */
  mono?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-line-soft px-5 py-4">
      <div>
        {eyebrow && (
          <p className={`${mono ? "eyebrow" : "section-label"} mb-1.5`}>{eyebrow}</p>
        )}
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}
