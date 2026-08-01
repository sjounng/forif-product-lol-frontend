"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRoom } from "@/components/group/RoomShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FEARLESS_LABEL } from "@/lib/constants";
import { fetchSessions } from "@/lib/api/sessions";
import type { ScrimSession } from "@/types";

const ACTIVE_STATUSES = ["PREPARING", "PROPOSED", "CONFIRMED", "IN_PROGRESS"];

const SESSION_STATUS_LABEL: Record<ScrimSession["status"], string> = {
  PREPARING: "준비 중",
  PROPOSED: "수락 대기",
  CONFIRMED: "확정",
  IN_PROGRESS: "진행 중",
  FINISHED: "종료",
  CANCELLED: "취소",
};

export default function RoomOverviewPage() {
  const { room } = useRoom();
  const [sessions, setSessions] = useState<ScrimSession[] | null>(null);

  useEffect(() => {
    let active = true;
    fetchSessions(room.id)
      .then((loaded) => {
        if (active) setSessions(loaded);
      })
      .catch(() => {
        if (active) setSessions([]);
      });
    return () => {
      active = false;
    };
  }, [room.id]);

  const activeSession = useMemo(
    () => sessions?.find((session) => ACTIVE_STATUSES.includes(session.status)) ?? null,
    [sessions],
  );
  const latestSessions = sessions?.slice(0, 3) ?? [];

  const metrics = [
    { label: "참가자", value: String(room.participantCount), unit: "명" },
    { label: "누적 세션", value: String(room.sessionCount), unit: "회" },
    { label: "누적 매치", value: String(room.matchCount), unit: "경기" },
    {
      label: "게스트 입장 허용",
      value: room.guestAdmissionEnabled ? "O" : "X",
      unit: room.guestAdmissionEnabled ? "허용" : "차단",
      positive: room.guestAdmissionEnabled,
    },
  ];

  return (
    <main className="px-8 py-8">
      <section className="relative mb-7 overflow-hidden rounded-xl border border-line bg-surface px-6 py-7">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0">
            <p className="eyebrow mb-2">그룹 개요</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-2xl font-semibold tracking-tight">{room.name}</h1>
              <Badge>{room.publicCode}</Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              {room.description ?? "세션과 참가자 전적을 한곳에서 관리하는 스크림 그룹입니다."}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/rooms/${room.id}/players`}>
              <Button size="sm">참가자 보기</Button>
            </Link>
            <Link href={`/rooms/${room.id}/sessions`}>
              <Button variant="primary" size="sm">세션 보기</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="relative overflow-hidden px-5 py-5">
            <p className="eyebrow">{metric.label}</p>
            <div className="mt-3 flex items-end gap-2">
              <strong
                className={`tabular text-3xl font-semibold ${
                  metric.positive === true
                    ? "text-gain"
                    : metric.positive === false
                      ? "text-loss"
                      : "text-text"
                }`}
              >
                {metric.value}
              </strong>
              <span className="mb-1 text-xs text-dim">{metric.unit}</span>
            </div>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <Card>
          <CardHeader eyebrow="현재 상태" title="진행 중인 세션" />
          <div className="px-5 py-5">
            {sessions === null ? (
              <p className="text-sm text-muted">세션 상태를 불러오는 중…</p>
            ) : activeSession ? (
              <div className="rounded-lg border border-gold/25 bg-gold/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{activeSession.name ?? "이름 없는 세션"}</p>
                      <Badge tone={activeSession.status === "IN_PROGRESS" ? "gain" : "neutral"}>
                        {SESSION_STATUS_LABEL[activeSession.status]}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-dim">
                      {FEARLESS_LABEL[activeSession.fearlessMode]} · 완료 {activeSession.gameCount}경기
                    </p>
                  </div>
                  <Link href={`/rooms/${room.id}/sessions/${activeSession.id}`}>
                    <Button variant="primary" size="sm">세션 열기</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-muted">현재 진행 중인 세션이 없습니다.</p>
                <Link href={`/rooms/${room.id}/sessions`} className="mt-4 inline-block">
                  <Button variant="primary" size="sm">새 세션 준비하기</Button>
                </Link>
              </div>
            )}

            {latestSessions.length > 0 && (
              <div className="mt-5 border-t border-line-soft pt-4">
                <p className="eyebrow mb-2">최근 세션</p>
                <ul className="space-y-1">
                  {latestSessions.map((session) => (
                    <li key={session.id}>
                      <Link
                        href={`/rooms/${room.id}/sessions/${session.id}`}
                        className="flex items-center justify-between gap-3 rounded px-2 py-2 text-xs text-muted hover:bg-bg hover:text-text"
                      >
                        <span className="truncate">{session.name ?? `세션 #${session.id}`}</span>
                        <span>{SESSION_STATUS_LABEL[session.status]} · {session.gameCount}경기</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="운영 정보" title="그룹 상태" />
          <dl className="divide-y divide-line-soft px-5 py-2 text-sm">
            <div className="flex items-center justify-between gap-4 py-4">
              <dt className="text-muted">그룹 소유자</dt>
              <dd>{room.owner.displayName}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-4">
              <dt className="text-muted">게스트 입장</dt>
              <dd className={room.guestAdmissionEnabled ? "text-gain" : "text-loss"}>
                {room.guestAdmissionEnabled ? "O · 허용" : "X · 차단"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-4">
              <dt className="text-muted">입장 비밀번호</dt>
              <dd>{room.entryPasswordProtected ? "사용 중" : "사용 안 함"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-4">
              <dt className="text-muted">그룹 상태</dt>
              <dd><Badge tone="gain">활성</Badge></dd>
            </div>
          </dl>
        </Card>
      </div>
    </main>
  );
}
