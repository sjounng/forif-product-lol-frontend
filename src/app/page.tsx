import Link from "next/link";
import { NavBar } from "@/components/layout/NavBar";
import { BalanceBeam } from "@/components/session/BalanceBeam";
import { Button } from "@/components/ui/Button";
import { TeamBoard } from "@/components/session/TeamBoard";
import { mockCandidates } from "@/lib/mock";

/**
 * 메인 페이지. 여기 오는 사람은 둘 중 하나다.
 *   ① 방을 만들려는 사람  → 로그인/회원가입
 *   ② 디스코드 링크를 받고 온 참가자 → 입장 코드
 * 그래서 진입점을 두 개만 둔다. 그 외의 것은 넣지 않는다.
 *
 * TODO(A): 로그인 상태면 히어로의 "방 만들기"를 "내 그룹으로" 로 바꾼다.
 */
export default function HomePage() {
  const best = mockCandidates[0];
  const blueTotal = best.assignment
    .filter((a) => a.side === "BLUE")
    .reduce((sum, a) => sum + a.effRating, 0);
  const redTotal = best.assignment
    .filter((a) => a.side === "RED")
    .reduce((sum, a) => sum + a.effRating, 0);

  return (
    <>
      <NavBar />

      <main>
        {/* 히어로 — 이 제품이 하는 일을 말이 아니라 실물로 보여준다 */}
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div>
              <p className="eyebrow mb-4">리그 오브 레전드 내전 운영</p>
              <h1 className="text-3xl font-semibold leading-[1.25] tracking-tight sm:text-4xl">
                내전에서 제일 어려운 건
                <br />
                팀 나누기입니다
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
                솔랭 티어로 시작 점수를 매기고, 라인 선호까지 맞춰서 10명을 두
                팀으로 나눕니다. 경기가 쌓이면 점수는 이 그룹에서의 실제 실력으로
                수렴합니다.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button variant="primary">방 만들기</Button>
                </Link>
                <Link href="/r/">
                  <Button>코드로 입장하기</Button>
                </Link>
              </div>

              <p className="mt-4 text-xs text-dim">
                참가자는 계정이 필요 없습니다. 방장이 준 링크와 코드로 바로
                들어옵니다.
              </p>
            </div>

            {/* 실제 팀 구성 결과 그대로 */}
            <div className="rounded-[10px] border border-line bg-surface p-5">
              <div className="mb-5">
                <BalanceBeam blueTotal={blueTotal} redTotal={redTotal} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TeamBoard side="BLUE" assignment={best.assignment} />
                <TeamBoard side="RED" assignment={best.assignment} />
              </div>
            </div>
          </div>
        </section>

        {/* 3단 스코프 — 이 제품의 멘탈 모델이자 실제 데이터 계층 */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="eyebrow mb-3">구조</p>
            <h2 className="mb-10 text-xl font-semibold tracking-tight">
              그룹 안에 회차가, 회차 안에 경기가 있습니다
            </h2>

            <div className="grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-3">
              <div className="bg-surface p-6">
                <p className="eyebrow mb-3">그룹</p>
                <p className="text-sm font-medium">사람이 모이는 단위</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  명단과 점수, 전적이 여기에 계속 쌓입니다. 인원 제한은 없습니다.
                </p>
              </div>

              <div className="bg-surface p-6">
                <p className="eyebrow mb-3">회차</p>
                <p className="text-sm font-medium">하루치 내전</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  피어리스 챔피언 풀이 유지되는 범위입니다. 10명이 넘으면 돌아가며
                  뜁니다.
                </p>
              </div>

              <div className="bg-surface p-6">
                <p className="eyebrow mb-3">경기</p>
                <p className="text-sm font-medium">한 게임</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  밴픽과 결과, 점수 변동이 남습니다. 정확히 10명입니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
