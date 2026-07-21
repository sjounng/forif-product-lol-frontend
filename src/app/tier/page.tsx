import { NavBar } from "@/components/layout/NavBar";
import { Card, CardHeader } from "@/components/ui/Card";

/**
 * 티어 — 솔랭 티어가 내전 시작 점수로 어떻게 환산되는지 (DESIGN §4.1).
 *
 * "왜 내 시작 점수가 이거냐"는 질문이 반드시 나온다. 그때 이 페이지를 보여주면 된다.
 * 계산은 서버와 똑같은 식이어야 하므로 값을 손으로 적지 말고 백엔드에서 받아올 것.
 *
 * TODO(공통): 표를 GET /api/tiers 로 받아온다. 압축 계수(0.55)는 방마다 다를 수 있고
 *             DESIGN §11 대로 데이터가 쌓이면 재보정할 값이라 하드코딩하면 안 된다.
 *
 * 참고 — 이 페이지를 "그룹 통합 랭킹"으로 만들려면 스키마 결정이 하나 필요하다.
 * 현재 점수는 player_id(방 단위)에 붙어 있어서 방을 넘는 랭킹이 성립하지 않는다.
 * (CLAUDE.md §9 "글로벌 랭킹 필요 여부" — 필요하면 riot_account_ratings 추가)
 */
const CONVERSION = [
  { rank: "아이언 IV", lp: "0 LP", ladder: 0, seed: 730 },
  { rank: "실버 II", lp: "0 LP", ladder: 1000, seed: 1280 },
  { rank: "골드 II", lp: "0 LP", ladder: 1400, seed: 1500, pivot: true },
  { rank: "플래티넘 II", lp: "0 LP", ladder: 1800, seed: 1720 },
  { rank: "다이아 II", lp: "0 LP", ladder: 2600, seed: 2160 },
  { rank: "마스터", lp: "0 LP", ladder: 2800, seed: 2270 },
  { rank: "챌린저", lp: "0 LP", ladder: 3600, seed: 2710 },
];

export default function TierPage() {
  return (
    <>
      <NavBar />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-10">
          <p className="eyebrow mb-3">티어</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            솔랭 티어는 시작점일 뿐입니다
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            처음 등록하면 솔랭 티어를 내전 점수로 환산해 출발합니다. 내전은
            밸런싱된 팀 게임이라 솔랭만큼 실력차가 벌어지지 않아서, 솔랭 4000점
            폭을 내전 2200점 폭으로 압축합니다. 5경기 정도면 실제 내전 실력으로
            수렴합니다.
          </p>
        </div>

        <Card>
          <CardHeader eyebrow="환산표" title="솔랭 티어 → 내전 시작 점수" />

          <div className="flex items-center gap-4 border-b border-line px-5 py-2.5">
            <span className="eyebrow flex-1">솔랭</span>
            <span className="eyebrow w-24 text-right">환산 점수</span>
            <span className="eyebrow w-24 text-right">내전 시작</span>
          </div>

          <ul>
            {CONVERSION.map((row) => (
              <li
                key={row.rank}
                className="flex items-center gap-4 border-b border-line-soft px-5 py-3 last:border-b-0"
              >
                <span className="flex flex-1 items-center gap-2 text-sm">
                  {row.rank}
                  <span className="tabular text-xs text-dim">{row.lp}</span>
                  {row.pivot && (
                    <span className="text-[11px] text-gold">기준점</span>
                  )}
                </span>
                <span className="tabular w-24 text-right text-[13px] text-muted">
                  {row.ladder.toLocaleString()}
                </span>
                <span
                  className={`tabular w-24 text-right text-sm ${row.pivot ? "text-gold" : ""}`}
                >
                  {row.seed.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="mt-6 space-y-2 text-[13px] leading-relaxed text-dim">
          <p>
            언랭이면 1000점(실버 II 근처)에서 시작하고, 불확실성을 크게 잡아
            빠르게 교정합니다.
          </p>
          <p>
            점수는 그룹마다 따로 쌓입니다. 같은 롤 계정이라도 다른 그룹에서는
            점수가 따로 움직입니다.
          </p>
        </div>
      </main>
    </>
  );
}
