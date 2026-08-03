"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";
import { createRoom, fetchCaptainInvitations, fetchRooms, respondToCaptainInvitation } from "@/lib/api/rooms";
import type { CaptainInvitation, GroupRole, Room } from "@/types";

const ROLE_LABEL: Record<GroupRole, string> = {
  GROUP_OWNER: "소유자",
  GROUP_MANAGER: "관리자",
  GROUP_MEMBER: "회원",
};

export default function RoomsPage() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [invitations, setInvitations] = useState<CaptainInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const [roomList, invitationList] = await Promise.all([fetchRooms(), fetchCaptainInvitations()]);
      setRooms(roomList);
      setInvitations(invitationList.filter((item) => item.status === "PENDING"));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "그룹을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;
    Promise.all([fetchRooms(), fetchCaptainInvitations()])
      .then(([roomList, invitationList]) => {
        if (!active) return;
        setRooms(roomList);
        setInvitations(invitationList.filter((item) => item.status === "PENDING"));
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "그룹을 불러오지 못했습니다.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isLoggedIn]);

  function join(event: FormEvent) {
    event.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code) router.push(`/r/${encodeURIComponent(code)}`);
  }

  async function respond(id: number, response: "accept" | "reject") {
    try {
      await respondToCaptainInvitation(id, response);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "초대를 처리하지 못했습니다.");
    }
  }

  if (authLoading) return <main className="mx-auto w-full max-w-4xl px-6 py-12 text-sm text-muted">불러오는 중…</main>;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div><p className="eyebrow mb-2">그룹</p><h1 className="text-xl font-semibold">내전 그룹</h1></div>
        {isLoggedIn && <Button variant="primary" onClick={() => setCreating((value) => !value)}>{creating ? "닫기" : "그룹 만들기"}</Button>}
      </div>

      <Card className="mb-7">
        <CardHeader eyebrow="초대받았나요?" title="그룹 코드로 참가" />
        <form className="flex gap-2 px-5 py-5" onSubmit={join}>
          <Input value={joinCode} onChange={(event) => setJoinCode(event.target.value)} placeholder="8자리 그룹 코드" maxLength={8} required />
          <Button type="submit" variant="primary">입장</Button>
        </form>
        {!isLoggedIn && <p className="border-t border-line-soft px-5 py-3 text-xs text-dim">로그인하지 않아도 닉네임과 그룹 코드로 참가할 수 있습니다.</p>}
      </Card>

      {error && <p role="alert" className="mb-5 text-sm text-loss">{error}</p>}

      {!isLoggedIn ? (
        <Card className="px-5 py-10 text-center"><p className="text-sm text-muted">내 그룹을 만들고 관리하려면 로그인해 주세요.</p></Card>
      ) : (
        <>
          {creating && <CreateGroupCard onCreated={(room) => { setRooms((current) => [room, ...current]); setCreating(false); }} />}

          {invitations.length > 0 && (
            <Card className="mb-7">
              <CardHeader eyebrow="받은 요청" title="그룹 초대" />
              <ul>{invitations.map((invitation) => (
                <li key={invitation.id} className="flex items-center gap-3 border-b border-line-soft px-5 py-4 last:border-0">
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium">{invitation.roomName}</p><p className="mt-1 text-xs text-dim">{invitation.inviter.displayName} 님의 초대</p></div>
                  <Button size="sm" onClick={() => void respond(invitation.id, "reject")}>거절</Button>
                  <Button size="sm" variant="primary" onClick={() => void respond(invitation.id, "accept")}>수락</Button>
                </li>
              ))}</ul>
            </Card>
          )}

          {loading ? <p className="py-10 text-center text-sm text-muted">그룹을 불러오는 중…</p> : rooms.length === 0 ? (
            <Card className="px-5 py-10 text-center"><p className="text-sm text-muted">참여 중인 그룹이 없습니다.</p></Card>
          ) : (
            <ul className="space-y-2">{rooms.map((room) => (
              <li key={room.id}><Link href={`/rooms/${room.id}`} className="flex items-center gap-4 rounded-[10px] border border-line bg-surface px-5 py-4 hover:border-dim">
                <div className="min-w-0 flex-1"><p className="truncate text-[15px] font-medium">{room.name}</p><p className="mt-1 truncate text-xs text-dim">{room.description ?? "설명 없음"}</p></div>
                <Badge tone="gold">{ROLE_LABEL[room.myRole]}</Badge><span className="text-xs text-muted">{room.participantCount}명</span><Badge>{room.publicCode}</Badge>
              </Link></li>
            ))}</ul>
          )}
        </>
      )}
    </main>
  );
}

function CreateGroupCard({ onCreated }: { onCreated(room: Room): void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      setSaving(true);
      const room = await createRoom({
        name: String(data.get("name")),
        description: String(data.get("description")),
        guestAdmissionEnabled: data.get("guestAdmissionEnabled") === "on",
        entryPassword: String(data.get("entryPassword")),
      });
      onCreated(room);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "그룹을 만들지 못했습니다.");
    } finally { setSaving(false); }
  }
  return (
    <Card className="mb-7"><CardHeader eyebrow="새 그룹" title="기본 정보" />
      <form className="space-y-4 px-5 py-5" onSubmit={submit}>
        <Field label="그룹 이름"><Input name="name" maxLength={100} required /></Field>
        <Field label="설명"><Input name="description" maxLength={500} /></Field>
        <Field label="선택 입장 암호" hint="비워두면 초대 링크와 코드만으로 입장합니다."><Input name="entryPassword" type="password" minLength={4} maxLength={72} /></Field>
        <label className="flex items-center gap-2 text-sm"><input name="guestAdmissionEnabled" type="checkbox" defaultChecked /> 비회원 입장 허용</label>
        {error && <p className="text-sm text-loss">{error}</p>}
        <Button type="submit" variant="primary" disabled={saving}>{saving ? "만드는 중…" : "그룹 만들기"}</Button>
      </form>
    </Card>
  );
}
