import type { ReactNode } from "react";

/** 빈 화면은 분위기가 아니라 다음 행동을 알려주는 자리다 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className="text-sm font-medium text-text">{title}</p>
      <p className="max-w-sm text-[13px] leading-relaxed text-dim">
        {description}
      </p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
