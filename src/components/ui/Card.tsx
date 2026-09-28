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
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line-soft px-5 py-4">
      <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}
