import { ChampionGrid } from "@/components/draft/ChampionGrid";
import { DraftRail } from "@/components/draft/DraftRail";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  mockChampions,
  mockDraftSteps,
  mockFearlessUsed,
} from "@/lib/mock";

/**
 * 담당: A — 로드맵 5단계. 구현 비용이 가장 크고, 없어도 서비스는 돌아간다.
 *
 * 이 화면은 방장·주장·관전자가 동시에 본다. 사이드바 없는 전체 화면인 이유다.
 *
 * 반드시 지킬 것:
 *   - 타이머는 서버 소유다. 서버의 turn_deadline_at 과 현재 시각의 차를 표시만 한다.
 *     클라가 자체 카운트다운을 돌리면 팀마다 시계가 달라져 확정 시점이 어긋난다.
 *   - 좌석에 앉은 사람만 확정 버튼이 활성. 나머지는 전원 관전(읽기 전용)이다.
 *   - 서버가 UNIQUE(draft_id, champion_id) 로 중복 확정을 거부한다.
 *     낙관적으로 그리되 거부 응답이 오면 되돌릴 것.
 *
 * TODO(A):
 *   1. "use client" + connectDraftSocket(draftId)
 *   2. 재접속 시 draft_events 의 seq 이후만 받아 상태 복원
 *   3. 남은 시간 표시 (서버 deadline 기준). 5초 이하면 색으로 경고
 *   4. 타임아웃 자동 확정(is_auto=1) 결과를 화면에 반영 — 밴이면 패스, 픽이면 호버 챔프
 *   5. 관전자 수 표시
 */
export default async function DraftPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;

  const currentStep =
    mockDraftSteps.find((step) => step.championId === null)?.stepNo ?? 21;
  const active = mockDraftSteps.find((step) => step.stepNo === currentStep);
  const usedInThisDraft = mockDraftSteps
    .map((step) => step.championId)
    .filter((id): id is number => id !== null);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between border-b border-line px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-tight">밴픽</span>
          <Badge tone="gold">피어리스 (전체)</Badge>
          <span className="tabular text-xs text-dim">#{draftId}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-dim">관전 8명</span>
          {/* TODO(A): 서버 deadline 기준 남은 시간. 지금은 고정값 */}
          <span
            className={`tabular text-lg font-medium ${active?.side === "BLUE" ? "text-blue" : "text-red"}`}
          >
            0:24
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-6 py-6 lg:flex-row">
        <DraftRail
          side="BLUE"
          steps={mockDraftSteps}
          champions={mockChampions}
          currentStep={currentStep}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13px] text-muted">
              <span
                className={active?.side === "BLUE" ? "text-blue" : "text-red"}
              >
                {active?.side}
              </span>{" "}
              차례 —{" "}
              {active?.actionType === "BAN" ? "밴할" : "선택할"} 챔피언을
              고르세요
            </p>
            <span className="tabular text-xs text-dim">
              {currentStep} / {mockDraftSteps.length} 단계
            </span>
          </div>

          <ChampionGrid
            champions={mockChampions}
            usedInThisDraft={usedInThisDraft}
            fearlessUsed={mockFearlessUsed}
          />

          <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
            <p className="text-xs leading-relaxed text-dim">
              흐린 챔피언은 이번 판에서 이미 쓰였거나, 이번 세션에서 소진된
              챔피언입니다.
            </p>
            {/* TODO(A): 좌석에 앉은 사람만 활성화 */}
            <Button variant="primary">확정</Button>
          </div>
        </div>

        <DraftRail
          side="RED"
          steps={mockDraftSteps}
          champions={mockChampions}
          currentStep={currentStep}
        />
      </main>
    </div>
  );
}
