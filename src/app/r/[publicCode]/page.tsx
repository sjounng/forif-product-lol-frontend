"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import {
  enterRoom,
  fetchCurrentGuest,
  fetchPublicRoom,
  leaveGuestRoom,
  joinRoomByCode,
} from "@/lib/api/rooms";
import type { GuestEntry, PublicRoom } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function GuestEntryPage({
  params,
}: {
  params: Promise<{ publicCode: string }>;
}) {
  const { publicCode: rawCode } = use(params);
  const publicCode = rawCode.toUpperCase();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [entry, setEntry] = useState<GuestEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchPublicRoom(publicCode),
      fetchCurrentGuest(publicCode).catch(() => null),
    ])
      .then(([publicRoom, current]) => {
        if (!active) return;
        setRoom(publicRoom);
        setEntry(current);
      })
      .catch((caught) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "그룹을 찾을 수 없습니다.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [publicCode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      const joined = await enterRoom(
        publicCode,
        String(data.get("entryPassword")),
        String(data.get("nickname")),
      );
      setEntry(joined);
      setRoom(joined.room);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "입장하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function leave() {
    try {
      await leaveGuestRoom(publicCode);
      setEntry(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "그룹에서 퇴장하지 못했습니다.");
    }
  }

  async function joinAsMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      const joined = await joinRoomByCode(publicCode, String(data.get("entryPassword")));
      router.replace(`/rooms/${joined.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "그룹에 참가하지 못했습니다.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted">
        그룹을 확인하는 중…
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 text-sm text-loss">
        {error}
      </div>
    );
  }

  if (entry) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md px-6 py-7">
          <p className="eyebrow mb-2">{entry.room.publicCode}</p>
          <h1 className="text-xl font-semibold">{entry.room.name}</h1>
          <p className="mt-3 text-sm">
            <span className="text-gold">{entry.guest.nickname}</span> 님으로 입장했습니다.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            게스트는 그룹과 진행 중인 밴픽을 실시간으로 관전할 수 있습니다.
            조작 권한은 세션의 BLUE/RED 팀장에게만 있습니다.
          </p>
          <Button variant="danger" className="mt-5 w-full" onClick={() => void leave()}>그룹에서 퇴장</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="eyebrow mb-2">{publicCode}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {room?.name ?? "그룹에 들어가기"}
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {room?.description ?? "계정 없이 게스트 관전자로 참여합니다."}
          </p>
        </div>

        {!room?.guestAdmissionEnabled ? (
          <p className="rounded-md border border-line bg-surface px-4 py-3 text-sm text-muted">
            현재 이 그룹은 신규 게스트 입장을 받지 않습니다.
          </p>
        ) : isLoggedIn ? (
          <form className="space-y-4" onSubmit={joinAsMember}>
            {room.entryPasswordProtected && <Field label="입장 암호"><Input name="entryPassword" type="password" required /></Field>}
            {error && <p className="text-sm text-loss">{error}</p>}
            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>{submitting ? "참가 중…" : "회원으로 그룹 참가"}</Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {room.entryPasswordProtected && (
              <Field label="입장 암호">
                <Input
                  name="entryPassword"
                  type="password"
                  autoComplete="off"
                  required
                />
              </Field>
            )}
            <Field label="표시 이름" hint="그룹과 관전 화면에 보일 이름입니다.">
              <Input name="nickname" maxLength={50} required />
            </Field>
            {error && <p className="text-sm text-loss">{error}</p>}
            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              {submitting ? "입장 중…" : "입장하기"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
