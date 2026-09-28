"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRoom } from "@/components/group/RoomShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Dialog, TextPromptDialog } from "@/components/ui/Dialog";
import { addPlayer, fetchPlayers, removePlayer, renamePlayer, syncPlayers } from "@/lib/api/players";
import {
  changeRoomMemberRole,
  fetchGuests,
  fetchRoomMembers,
  removeGuest,
  removeRoomMember,
  renameGuest,
} from "@/lib/api/rooms";
import type { GroupGuest, Player, RoomMember } from "@/types";
import { LanePreferenceIcons } from "@/components/ui/LaneIcon";
import { formatRank } from "@/lib/format";

const ROLE_LABEL = {
  GROUP_OWNER: "소유자",
  GROUP_MANAGER: "관리자",
  GROUP_MEMBER: "회원",
} as const;

type ParticipantDialog =
  | { kind: "removeMember"; member: RoomMember }
  | { kind: "editRiot"; player: Player }
  | { kind: "removeRiot"; player: Player }
  | { kind: "editGuest"; guest: GroupGuest }
  | { kind: "removeGuest"; guest: GroupGuest };

export default function PlayersPage() {
  const { room, reload } = useRoom();
  const canManage =
    room.myRole === "GROUP_OWNER" || room.myRole === "GROUP_MANAGER";
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [guests, setGuests] = useState<GroupGuest[]>([]);
  const [riotPlayers, setRiotPlayers] = useState<Player[]>([]);
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [participantQuery, setParticipantQuery] = useState("");
  const [dialog, setDialog] = useState<ParticipantDialog | null>(null);
  const [dialogValue, setDialogValue] = useState("");
  const [dialogSaving, setDialogSaving] = useState(false);

  const normalizedQuery = participantQuery.trim().toLocaleLowerCase("ko");
  const visibleMembers = useMemo(
    () => members.filter((member) => {
      const riotId = member.player?.riotAccount
        ? `${member.player.riotAccount.gameName}#${member.player.riotAccount.tagLine}`
        : "";
      return `${member.user.displayName} ${riotId}`.toLocaleLowerCase("ko").includes(normalizedQuery);
    }),
    [members, normalizedQuery],
  );
  const visibleRiotPlayers = useMemo(
    () => riotPlayers
      .filter((player) => player.memberUserId === null)
      .filter((player) => {
        const riotId = player.riotAccount
          ? `${player.riotAccount.gameName}#${player.riotAccount.tagLine}`
          : "";
        return `${player.displayName} ${riotId}`.toLocaleLowerCase("ko").includes(normalizedQuery);
      }),
    [normalizedQuery, riotPlayers],
  );
  const visibleGuests = useMemo(
    () => guests.filter((guest) =>
      guest.nickname.toLocaleLowerCase("ko").includes(normalizedQuery),
    ),
    [guests, normalizedQuery],
  );

  const load = useCallback(async () => {
    try {
      const [memberList, guestList, playerList] = await Promise.all([
        fetchRoomMembers(room.id),
        canManage ? fetchGuests(room.id) : Promise.resolve([]),
        fetchPlayers(room.id),
      ]);
      setError(null);
      setMembers(memberList);
      setGuests(guestList);
      setRiotPlayers(playerList);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "참가자를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [canManage, room.id]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchRoomMembers(room.id),
      canManage ? fetchGuests(room.id) : Promise.resolve([]),
      fetchPlayers(room.id),
    ])
      .then(([memberList, guestList, playerList]) => {
        if (!active) return;
        setMembers(memberList);
        setGuests(guestList);
        setRiotPlayers(playerList);
        setError(null);
      })
      .catch((caught) => {
        if (!active) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "참가자를 불러오지 못했습니다.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [canManage, room.id]);

  async function handleAddPlayer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setAdding(true);
      setError(null);
      const created = await addPlayer(room.id, { gameName, tagLine });
      setRiotPlayers((current) => [...current, created]);
      setGameName("");
      setTagLine("");
      await reload();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Riot ID 참가자를 추가하지 못했습니다.",
      );
    } finally {
      setAdding(false);
    }
  }

  async function changeRole(member: RoomMember) {
    const role =
      member.role === "GROUP_MANAGER" ? "GROUP_MEMBER" : "GROUP_MANAGER";
    try {
      await changeRoomMemberRole(room.id, member.user.id, role);
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "역할을 변경하지 못했습니다.",
      );
    }
  }

  async function handleSyncPlayers() {
    try {
      setSyncing(true);
      setError(null);
      setSyncNotice(null);
      const refreshed = await syncPlayers(room.id);
      await load();
      setSyncNotice(`${refreshed.length}명의 솔로랭크 정보를 갱신했습니다.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "솔로랭크 정보를 갱신하지 못했습니다.");
    } finally {
      setSyncing(false);
    }
  }

  async function confirmDialog() {
    if (!dialog) return;
    const value = dialogValue.trim();
    if ((dialog.kind === "editRiot" || dialog.kind === "editGuest") && !value) return;
    try {
      setDialogSaving(true);
      setError(null);
      if (dialog.kind === "removeMember") {
        await removeRoomMember(room.id, dialog.member.user.id);
        await Promise.all([load(), reload()]);
      } else if (dialog.kind === "editRiot") {
        await renamePlayer(room.id, dialog.player.id, value);
        await load();
      } else if (dialog.kind === "removeRiot") {
        await removePlayer(room.id, dialog.player.id);
        await Promise.all([load(), reload()]);
      } else if (dialog.kind === "editGuest") {
        await renameGuest(room.id, dialog.guest.id, value);
        await load();
      } else {
        await removeGuest(room.id, dialog.guest.id);
        await Promise.all([load(), reload()]);
      }
      setDialog(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "참가자 정보를 변경하지 못했습니다.");
      setDialog(null);
    } finally {
      setDialogSaving(false);
    }
  }

  function openEditDialog(action: Extract<ParticipantDialog, { kind: "editRiot" | "editGuest" }>) {
    setDialogValue(action.kind === "editRiot" ? action.player.displayName : action.guest.nickname);
    setDialog(action);
  }

  return (
    <main className="px-8 py-8">
      <div className="mb-8">
        <p className="section-label mb-2">참가자</p>
        <h1 className="text-xl font-semibold tracking-tight">
          회원 {members.length}명 · Riot ID {riotPlayers.filter((player) => player.memberUserId === null).length}명
          {canManage ? ` · 게스트 ${guests.length}명` : ""}
        </h1>
      </div>

      {error && (
        <p role="alert" className="mb-5 text-sm text-loss">
          {error}
        </p>
      )}
      <label className="mb-5 flex max-w-xl items-center gap-3 rounded-lg border border-line bg-surface px-4">
        <span aria-hidden="true" className="text-muted">⌕</span>
        <span className="sr-only">참가자 검색</span>
        <Input
          value={participantQuery}
          onChange={(event) => setParticipantQuery(event.target.value)}
          placeholder="이름 또는 Riot ID로 참가자 검색"
          className="h-11 border-0 bg-transparent px-0 focus:border-0"
        />
        {participantQuery && (
          <button
            type="button"
            onClick={() => setParticipantQuery("")}
            className="shrink-0 rounded px-2 py-1 text-sm text-muted hover:bg-raised hover:text-text"
          >
            지우기
          </button>
        )}
      </label>
      {canManage && riotPlayers.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={() => void handleSyncPlayers()} disabled={syncing}>
            {syncing ? "Riot 동기화 중…" : "솔로랭크 새로고침"}
          </Button>
          {syncNotice && <span className="text-sm text-gain">{syncNotice}</span>}
        </div>
      )}
      {loading ? (
        <p className="text-sm text-muted">참가자를 불러오는 중…</p>
      ) : (
        <div className="space-y-6">
          {canManage && (
            <Card>
              <CardHeader
                eyebrow="비회원 바로 추가"
                title="Riot ID로 참가자 등록"
              />
              <form
                onSubmit={handleAddPlayer}
                className="grid items-end gap-4 px-5 py-5 md:grid-cols-[minmax(0,1fr)_minmax(160px,0.45fr)_auto]"
              >
                <Field label="게임 이름">
                  <Input
                    value={gameName}
                    onChange={(event) => setGameName(event.target.value)}
                    minLength={3}
                    maxLength={16}
                    placeholder="Hide on bush"
                    autoComplete="off"
                    required
                  />
                </Field>
                <Field label="태그">
                  <Input
                    value={tagLine}
                    onChange={(event) => setTagLine(event.target.value)}
                    minLength={3}
                    maxLength={5}
                    placeholder="KR1"
                    autoComplete="off"
                    required
                  />
                </Field>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="h-10"
                  disabled={adding}
                >
                  {adding ? "Riot 확인 중…" : "그룹에 추가"}
                </Button>
              </form>
              <p className="border-t border-line-soft px-5 py-3 text-xs text-dim">
                Riot에서 계정 존재 여부를 확인한 뒤 비회원 참가자로 즉시
                등록합니다. 입력 예: Hide on bush # KR1
              </p>
            </Card>
          )}

          <Card>
            <CardHeader eyebrow="Riot 계정" title="비회원 참가자" />
            {visibleRiotPlayers.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">
                {normalizedQuery ? "검색된 Riot ID 참가자가 없습니다." : "등록된 Riot ID 참가자가 없습니다."}
              </p>
            ) : (
              <ul>
                {visibleRiotPlayers.map((player) => (
                  <li
                    key={player.id}
                    className="flex items-center gap-3 border-b border-line-soft px-5 py-3 last:border-b-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{player.displayName}</p>
                      <p className="mt-0.5 truncate text-xs text-dim">
                        {player.riotAccount
                          ? `${player.riotAccount.gameName}#${player.riotAccount.tagLine}`
                          : "Riot 계정 정보 없음"}
                      </p>
                    </div>
                    <LanePreferenceIcons primary={player.primaryLane === "FILL" ? null : player.primaryLane} secondary={player.secondaryLane === "FILL" ? null : player.secondaryLane} />
                    <Badge tone="gain">{formatRank(player.riotAccount)}</Badge>
                    {canManage && <><Button size="sm" onClick={() => openEditDialog({ kind: "editRiot", player })}>수정</Button><Button size="sm" variant="danger" onClick={() => setDialog({ kind: "removeRiot", player })}>삭제</Button></>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader eyebrow="로그인 계정" title="회원" />
            {visibleMembers.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">검색된 회원이 없습니다.</p>
            ) : <ul>
              {visibleMembers.map((member) => (
                <li
                  key={member.membershipId}
                  className="flex items-center gap-3 border-b border-line-soft px-5 py-3 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{member.user.displayName}</p>
                    {member.player?.riotAccount && <p className="mt-0.5 text-xs text-dim">{member.player.riotAccount.gameName}#{member.player.riotAccount.tagLine} · {formatRank(member.player.riotAccount)}</p>}
                  </div>
                  {member.player && <LanePreferenceIcons primary={member.player.primaryLane === "FILL" ? null : member.player.primaryLane} secondary={member.player.secondaryLane === "FILL" ? null : member.player.secondaryLane} />}
                  <Badge
                    tone={
                      member.role === "GROUP_OWNER" ? "gold" : "neutral"
                    }
                  >
                    {ROLE_LABEL[member.role]}
                  </Badge>
                  {room.myRole === "GROUP_OWNER" &&
                    member.role !== "GROUP_OWNER" && (
                      <Button
                        size="sm"
                        onClick={() => void changeRole(member)}
                      >
                        {member.role === "GROUP_MANAGER"
                          ? "관리자 해제"
                          : "관리자 지정"}
                      </Button>
                    )}
                  {canManage && member.role !== "GROUP_OWNER" && (
                    <Button size="sm" variant="danger" onClick={() => setDialog({ kind: "removeMember", member })}>삭제</Button>
                  )}
                </li>
              ))}
            </ul>}
          </Card>

          {canManage && (
            <Card>
              <CardHeader eyebrow="초대 링크 입장" title="게스트" />
              {visibleGuests.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted">
                  {normalizedQuery ? "검색된 게스트가 없습니다." : "입장한 게스트가 없습니다."}
                </p>
              ) : (
                <ul>
                  {visibleGuests.map((guest) => (
                    <li
                      key={guest.id}
                      className="flex flex-wrap items-center gap-2 border-b border-line-soft px-5 py-3 last:border-b-0"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {guest.nickname}
                      </span>
                      <Badge tone="gain">활성</Badge>
                      <Button size="sm" onClick={() => openEditDialog({ kind: "editGuest", guest })}>
                        이름 변경
                      </Button>
                      <Button size="sm" onClick={() => setDialog({ kind: "removeGuest", guest })}>
                        퇴장
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
      )}

      <TextPromptDialog
        open={dialog?.kind === "editRiot" || dialog?.kind === "editGuest"}
        title={dialog?.kind === "editGuest" ? "게스트 이름 변경" : "참가자 이름 변경"}
        value={dialogValue}
        onValueChange={setDialogValue}
        maxLength={50}
        pending={dialogSaving}
        onClose={() => setDialog(null)}
        onConfirm={() => void confirmDialog()}
      />
      <Dialog
        open={Boolean(dialog && dialog.kind !== "editRiot" && dialog.kind !== "editGuest")}
        title="참가자를 삭제할까요?"
        description={
          dialog?.kind === "removeMember"
            ? `${dialog.member.user.displayName} 님을 그룹에서 삭제합니다.`
            : dialog?.kind === "removeRiot"
              ? `${dialog.player.displayName} 님을 참가자 목록에서 삭제합니다.`
              : dialog?.kind === "removeGuest"
                ? `${dialog.guest.nickname} 님을 퇴장시킵니다.`
                : undefined
        }
        confirmLabel="삭제"
        danger
        pending={dialogSaving}
        onClose={() => setDialog(null)}
        onConfirm={() => void confirmDialog()}
      />
    </main>
  );
}
