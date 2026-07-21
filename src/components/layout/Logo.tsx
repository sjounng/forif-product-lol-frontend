/**
 * 로고 마크 = 밸런스 빔의 축소판.
 *
 * 이 제품이 하는 일은 결국 "두 팀을 한 축 위에서 맞추는 것"이다.
 * 세션 화면의 시그니처 요소를 그대로 줄여 쓰면 로고가 장식이 아니라
 * 제품의 요약이 된다.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* 축 */}
      <rect x="1" y="10" width="22" height="4" rx="1" fill="currentColor" opacity="0.16" />
      {/* 블루 쪽 무게 */}
      <rect x="4" y="10" width="8" height="4" rx="1" fill="var(--color-blue)" />
      {/* 레드 쪽 무게 — 살짝 더 짧게 해서 "기울어 있음"을 보여준다 */}
      <rect x="12" y="10" width="6" height="4" rx="1" fill="var(--color-red)" />
      {/* 원점 */}
      <rect x="11.5" y="6" width="1" height="12" rx="0.5" fill="currentColor" />
    </svg>
  );
}
