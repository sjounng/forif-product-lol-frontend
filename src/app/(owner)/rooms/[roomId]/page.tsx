"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRoom } from "@/components/group/RoomShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusTag, SESSION_STATUS_TONE } from "@/components/ui/StatusTag";
import { FEARLESS_LABEL, SESSION_STATUS_LABEL } from "@/lib/constants";
import { fetchSessions } from "@/lib/api/sessions";
import type { ScrimSession } from "@/types";

const ACTIVE_STATUSES = ["PREPARING", "PROPOSED", "CONFIRMED", "IN_PROGRESS"];

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

  const metrics = [
    { label: "참가자", value: `${room.participantCount}명` },
    { label: "누적 세션", value: `${room.sessionCount}회` },
    { label: "누적 매치", value: `${room.matchCount}경기` },
  ];

  return (
    <main className="px-8 py-8">
      <PageHeader
        title={
          <>
            <span className="truncate">{room.name}</span>
            <Badge>{room.publicCode}</Badge>
          </>
        }
      >
        {room.description && <p className="mt-2 text-sm text-muted">{room.description}</p>}
      </PageHeader>

      <Card className="mb-6 grid grid-cols-3 divide-x divide-line-soft">
        {metrics.map((metric) => (
          <div key={metric.label} className="min-w-0 px-4 py-4 sm:px-5 sm:py-5">
            <p className="whitespace-nowrap text-xs text-muted sm:text-sm">{metric.label}</p>
            <strong className="mt-2 block whitespace-nowrap text-xl font-semibold sm:mt-3 sm:text-3xl">
              {metric.value}
            </strong>
          </div>
        ))}
      </Card>

      <Card>
        <CardHeader title="진행 중인 세션" />
        <div className="px-5 py-5">
          {sessions === null ? (
            <p className="text-sm text-muted">불러오는 중…</p>
          ) : activeSession ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{activeSession.name ?? "이름 없는 세션"}</p>
                  <StatusTag tone={SESSION_STATUS_TONE[activeSession.status]}>
                    {SESSION_STATUS_LABEL[activeSession.status]}
                  </StatusTag>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {FEARLESS_LABEL[activeSession.fearlessMode]} · {activeSession.gameCount}경기
                </p>
              </div>
              <Link href={`/rooms/${room.id}/sessions/${activeSession.id}`}>
                <Button variant="primary" size="sm">세션 열기</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">진행 중인 세션이 없습니다.</p>
              <Link href={`/rooms/${room.id}/sessions`}>
                <Button variant="primary" size="sm">세션 제안</Button>
              </Link>
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}
