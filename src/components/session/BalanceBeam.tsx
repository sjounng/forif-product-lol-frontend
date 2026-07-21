import { DEFAULT_MAX_TOTAL_DIFF } from "@/lib/constants";

/**
 * 이 제품이 스프레드시트와 다른 유일한 지점.
 *
 * 두 팀의 점수를 막대 두 개로 그리면 "어느 쪽이 센가"만 보인다.
 * 중앙을 원점으로 둔 한 축에 그리면 "얼마나 기울었나"와 "허용 범위 안인가"가 같이 읽힌다.
 * 방장이 후보를 고를 때 실제로 답해야 하는 질문이 그거다.
 *
 * 눈금(제한선)을 넘어가면 하드 제약 위반이므로 색이 바뀐다 (DESIGN §5).
 */
export function BalanceBeam({
  blueTotal,
  redTotal,
  limit = DEFAULT_MAX_TOTAL_DIFF,
  compact = false,
}: {
  blueTotal: number;
  redTotal: number;
  limit?: number;
  compact?: boolean;
}) {
  const diff = blueTotal - redTotal;
  const heavier = diff === 0 ? null : diff > 0 ? "BLUE" : "RED";
  const overLimit = Math.abs(diff) > limit;

  // 축 반폭이 담는 최대 격차. 제한선이 눈에 보이는 위치에 오도록 여유를 둔다.
  const scale = Math.max(limit * 2.6, Math.abs(diff) * 1.15, 1);
  const fillPercent = Math.min((Math.abs(diff) / scale) * 50, 50);
  const limitPercent = Math.min((limit / scale) * 50, 50);

  const fillColor = overLimit
    ? "bg-gold"
    : heavier === "BLUE"
      ? "bg-blue"
      : "bg-red";

  return (
    <div>
      {!compact && (
        <div className="mb-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="eyebrow text-blue">BLUE</span>
            <span className="tabular text-lg font-medium">
              {blueTotal.toLocaleString()}
            </span>
          </div>

          <div className="text-center">
            <span className="eyebrow">격차</span>{" "}
            <span
              className={`tabular text-lg font-medium ${overLimit ? "text-gold" : "text-text"}`}
            >
              {Math.abs(diff)}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="tabular text-lg font-medium">
              {redTotal.toLocaleString()}
            </span>
            <span className="eyebrow text-red">RED</span>
          </div>
        </div>
      )}

      {/* 축 */}
      <div
        className={`relative w-full overflow-hidden rounded-sm bg-raised ${compact ? "h-1.5" : "h-3"}`}
        role="img"
        aria-label={
          heavier
            ? `${heavier} 진영이 ${Math.abs(diff)}점 높습니다. 허용 격차 ${limit}점`
            : "양 팀 점수가 같습니다"
        }
      >
        {/* 허용 격차 눈금 */}
        {!compact && (
          <>
            <span
              className="absolute top-0 h-full w-px bg-line"
              style={{ left: `${50 - limitPercent}%` }}
            />
            <span
              className="absolute top-0 h-full w-px bg-line"
              style={{ left: `${50 + limitPercent}%` }}
            />
          </>
        )}

        {/* 기울기 */}
        <span
          className={`absolute top-0 h-full transition-all ${fillColor}`}
          style={{
            width: `${fillPercent}%`,
            left: heavier === "RED" ? "50%" : `${50 - fillPercent}%`,
          }}
        />

        {/* 원점 */}
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-text/50" />
      </div>

      {!compact && (
        <p className="mt-2 text-xs text-dim">
          {overLimit ? (
            <span className="text-gold">
              허용 격차 {limit}점을 넘었습니다. 제약을 완화해 나온 후보입니다.
            </span>
          ) : (
            <>허용 격차 {limit}점 이내</>
          )}
        </p>
      )}
    </div>
  );
}
