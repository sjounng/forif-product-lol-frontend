import Link from "next/link";
import { BalanceBeam } from "@/components/session/BalanceBeam";
import { RotationTable } from "@/components/session/RotationTable";
import { TeamBoard } from "@/components/session/TeamBoard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  FEARLESS_DESCRIPTION,
  FEARLESS_LABEL,
  PLAYERS_PER_MATCH,
} from "@/lib/constants";
import {
  mockCandidates,
  mockSessionPlayers,
  mockSessions,
} from "@/lib/mock";

/**
 * ★ MVP의 종착점. 밴픽이 없어도 이 화면만 있으면 내전이 돌아간다. ★
 *
 * 담당: B
 *
 * 화면의 논리 순서 = 방장의 작업 순서다. 순서를 바꾸지 말 것.
 *   ① 누가 다음 판에 뛰나 (로테이션)  →  ② 팀을 어떻게 나누나 (밸런스 후보)  →  ③ 확정
 *
 * TODO(B):
 *   1. mockSessionPlayers → fetchSessionPlayers(sessionId)
 *   2. "팀 구성" 버튼 → runBalance(sessionId, targetGameNo)
 *      - 유효 인원 10명 미만이면 버튼 비활성 + "N명 더 필요합니다"
 *      - 응답이 relaxed=true 면 relaxNote 를 후보 위에 경고로 띄운다.
 *        그냥 "구성 실패"로 끝내지 말 것 — UX가 최악이 된다.
 *   3. 후보 선택 → POST matches. 선택한 candidateId 를 매치에 남겨야
 *      나중에 "왜 이렇게 나눴냐"를 재현할 수 있다.
 *   4. 경기 결과 입력 → 승리 진영 + (선택) KDA. 점수 반영은 서버 트랜잭션이다(DESIGN §9).
 *      rating_applied 플래그 때문에 재시도해도 중복 반영되지 않는다.
 *
 * TODO(A): 매치가 생기면 "밴픽 시작" 버튼이 여기 붙는다 → /draft/{draftId}
 */
export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ roomId: string; sessionId: string }>;
}) {
  const { roomId, sessionId } = await params;
  const session =
    mockSessions.find((s) => s.id === Number(sessionId)) ?? mockSessions[0];

  const best = mockCandidates[0];
  const blueTotal = best.assignment
    .filter((a) => a.side === "BLUE")
    .reduce((sum, a) => sum + a.effRating, 0);
  const redTotal = best.assignment
    .filter((a) => a.side === "RED")
    .reduce((sum, a) => sum + a.effRating, 0);

  const eligibleCount = mockSessionPlayers.filter(
    (p) => p.status !== "WITHDRAWN",
  ).length;
  const shortBy = Math.max(0, PLAYERS_PER_MATCH - eligibleCount);

  return (
    <main className="px-8 py-8">
      <div className="mb-8">
        <Link
          href={`/rooms/${roomId}/sessions`}
          className="eyebrow hover:text-muted"
        >
          ← 세션 목록
        </Link>
        <h1 className="mt-2.5 text-xl font-semibold tracking-tight">
          {session.name ?? "이름 없는 세션"}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone={session.fearlessMode === "NONE" ? "neutral" : "gold"}>
            {FEARLESS_LABEL[session.fearlessMode]}
          </Badge>
          <span className="text-xs text-dim">
            {FEARLESS_DESCRIPTION[session.fearlessMode]}
          </span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* ① 로테이션 */}
        <Card className="h-fit">
          <CardHeader
            eyebrow={`${session.gameCount + 1}번째 게임`}
            title="투입 순번"
            action={
              <span className="tabular text-xs text-dim">
                {eligibleCount}명 참가
              </span>
            }
          />
          <div className="border-b border-line-soft px-5 py-2.5">
            <p className="text-xs leading-relaxed text-dim">
              적게 뛴 사람이 먼저 들어갑니다. 점선 위 {PLAYERS_PER_MATCH}명이
              다음 판 후보입니다.
            </p>
          </div>
          <RotationTable players={mockSessionPlayers} />
        </Card>

        {/* ② 팀 구성 */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              eyebrow="팀 구성"
              title={`후보 ${mockCandidates.length}개`}
              action={
                <Button variant="primary" size="sm" disabled={shortBy > 0}>
                  {shortBy > 0 ? `${shortBy}명 더 필요합니다` : "다시 구성"}
                </Button>
              }
            />

            <div className="space-y-6 px-5 py-5">
              <BalanceBeam blueTotal={blueTotal} redTotal={redTotal} />

              <div className="grid gap-4 sm:grid-cols-2">
                <TeamBoard side="BLUE" assignment={best.assignment} />
                <TeamBoard side="RED" assignment={best.assignment} />
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line-soft pt-4 text-xs text-dim">
                <span>
                  라인 최대 격차{" "}
                  <span className="tabular text-muted">{best.maxLaneDiff}</span>
                </span>
                <span>
                  오프롤{" "}
                  <span className="tabular text-muted">
                    {best.offRoleCount}명
                  </span>
                </span>
                <span>
                  예상 BLUE 승률{" "}
                  <span className="tabular text-muted">
                    {Math.round(best.predictedBlueWinrate * 100)}%
                  </span>
                </span>
              </div>

              <p className="text-xs leading-relaxed text-dim">
                <span className="text-gold">*</span> 표시는 주라인이 아닌 배정입니다.
                팀 구성에는 점수를 낮춰 반영했고, 지더라도 점수가 덜 깎입니다.
              </p>
            </div>
          </Card>

          {/* 다른 후보들 */}
          <Card>
            <CardHeader eyebrow="비교" title="다른 후보" />
            <ul>
              {mockCandidates.map((candidate) => (
                <li
                  key={candidate.id}
                  className="flex items-center gap-4 border-b border-line-soft px-5 py-3 last:border-b-0"
                >
                  <span className="tabular w-6 text-xs text-dim">
                    {candidate.rankNo}
                  </span>
                  <div className="min-w-0 flex-1">
                    <BalanceBeam
                      blueTotal={5000 + candidate.totalDiff}
                      redTotal={5000}
                      compact
                    />
                  </div>
                  <span className="tabular w-12 text-right text-[13px] text-muted">
                    ±{candidate.totalDiff}
                  </span>
                  <span className="tabular w-20 text-right text-xs text-dim">
                    라인 {candidate.maxLaneDiff}
                  </span>
                  <span className="w-16 text-right">
                    {candidate.offRoleCount > 0 && (
                      <Badge tone="quiet">오프롤 {candidate.offRoleCount}</Badge>
                    )}
                  </span>
                  <Button size="sm">선택</Button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </main>
  );
}
