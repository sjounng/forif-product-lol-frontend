import type { ReactNode } from "react";

/** 페이지 제목 줄. 모든 페이지가 같은 크기·간격의 제목을 쓰도록 여기로 모은다. */
export function PageHeader({
  title,
  action,
  children,
}: {
  title: ReactNode;
  action?: ReactNode;
  /** 제목 아래 한 줄 (그룹 설명 등). 설명문이 아니라 데이터일 때만 쓴다. */
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="flex flex-wrap items-center gap-3 text-xl font-semibold tracking-tight">
          {title}
        </h1>
        {children}
      </div>
      {action}
    </div>
  );
}
