"use client";

import { useCallback, useEffect, useState } from "react";
import { useRoom } from "@/components/group/RoomShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
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

  async function removeMember(member: RoomMember) {
    if (!window.confirm(`${member.user.displayName} 님을 그룹에서 삭제할까요?`)) return;
    try {
      await removeRoomMember(room.id, member.user.id);
      await Promise.all([load(), reload()]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "회원을 삭제하지 못했습니다.");
    }
  }

  async function editRiotPlayer(player: Player) {
    const displayName = window.prompt("그룹에 표시할 이름", player.displayName);
    if (!displayName || displayName === player.displayName) return;
    try {
      await renamePlayer(room.id, player.id, displayName);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "참가자 이름을 변경하지 못했습니다.");
    }
  }

  async function deleteRiotPlayer(player: Player) {
    if (!window.confirm(`${player.displayName} 님을 참가자 목록에서 삭제할까요?`)) return;
    try {
      await removePlayer(room.id, player.id);
      await Promise.all([load(), reload()]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "참가자를 삭제하지 못했습니다.");
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

  async function editGuest(guest: GroupGuest) {
    const nickname = window.prompt("새 닉네임", guest.nickname);
    if (!nickname || nickname === guest.nickname) return;
    try {
      await renameGuest(room.id, guest.id, nickname);
      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "닉네임을 변경하지 못했습니다.",
      );
    }
  }

  async function remove(guest: GroupGuest) {
    if (!window.confirm(`${guest.nickname} 님을 퇴장시킬까요?`)) return;
    try {
      await removeGuest(room.id, guest.id);
      await Promise.all([load(), reload()]);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "퇴장시키지 못했습니다.",
      );
    }
  }

  return (
    <main className="px-8 py-8">
      <div className="mb-8">
        <p className="eyebrow mb-2">참가자</p>
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
            {riotPlayers.filter((player) => player.memberUserId === null).length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted">
                등록된 Riot ID 참가자가 없습니다.
              </p>
            ) : (
              <ul>
                {riotPlayers.filter((player) => player.memberUserId === null).map((player) => (
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
                    {canManage && <><Button size="sm" onClick={() => void editRiotPlayer(player)}>수정</Button><Button size="sm" variant="danger" onClick={() => void deleteRiotPlayer(player)}>삭제</Button></>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader eyebrow="로그인 계정" title="회원" />
            <ul>
              {members.map((member) => (
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
                    <Button size="sm" variant="danger" onClick={() => void removeMember(member)}>삭제</Button>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          {canManage && (
            <Card>
              <CardHeader eyebrow="초대 링크 입장" title="게스트" />
              {guests.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted">
                  입장한 게스트가 없습니다.
                </p>
              ) : (
                <ul>
                  {guests.map((guest) => (
                    <li
                      key={guest.id}
                      className="flex flex-wrap items-center gap-2 border-b border-line-soft px-5 py-3 last:border-b-0"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {guest.nickname}
                      </span>
                      <Badge tone="gain">활성</Badge>
                      <Button size="sm" onClick={() => void editGuest(guest)}>
                        이름 변경
                      </Button>
                      <Button size="sm" onClick={() => void remove(guest)}>
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
    </main>
  );
}
