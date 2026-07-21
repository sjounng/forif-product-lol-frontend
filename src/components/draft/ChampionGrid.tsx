import type { Champion } from "@/types";

/**
 * 챔피언 그리드. 실제로는 160여 개가 깔린다.
 *
 * 회색 처리의 이유가 두 가지라 구분이 필요하다:
 *   - 이번 판에서 이미 밴/픽됨  → 평범하게 죽임
 *   - 피어리스로 소진됨(이전 판) → 같이 죽이되 이유를 툴팁으로 알려준다.
 *     "왜 못 뽑지?"가 밴픽 중 가장 흔한 질문이다.
 *
 * TODO(A):
 *   1. mockChampions → fetchChampions() (Data Dragon 동기화된 champions 테이블)
 *   2. 이미지 붙이기. 160개를 한 번에 로드하면 느리다 — lazy + 스프라이트 고려
 *   3. 검색/역할 필터. 밴픽은 30초 안에 끝내야 해서 검색이 사실상 필수다
 *   4. 클릭 = 호버(임시 선택), 확정은 별도 버튼. 실수로 확정되면 되돌릴 수 없다
 */
export function ChampionGrid({
  champions,
  usedInThisDraft,
  fearlessUsed,
}: {
  champions: Champion[];
  usedInThisDraft: number[];
  fearlessUsed: number[];
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-8">
      {champions.map((champion) => {
        const takenNow = usedInThisDraft.includes(champion.id);
        const takenByFearless = fearlessUsed.includes(champion.id);
        const disabled = takenNow || takenByFearless;

        return (
          <button
            key={champion.id}
            type="button"
            disabled={disabled}
            title={
              takenByFearless
                ? `${champion.nameKo} — 이번 세션에서 이미 소진됨`
                : takenNow
                  ? `${champion.nameKo} — 이번 판에서 사용됨`
                  : champion.nameKo
            }
            className={`flex aspect-square flex-col items-center justify-center rounded border p-1 text-center text-[10px] leading-tight transition-colors ${
              disabled
                ? "cursor-not-allowed border-line-soft bg-surface/40 text-dim/40"
                : "border-line bg-surface text-muted hover:border-gold hover:text-text"
            }`}
          >
            <span className="line-clamp-2">{champion.nameKo}</span>
            {takenByFearless && (
              <span className="mt-0.5 text-[8px] text-gold/50">소진</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
