"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRoom } from "@/components/group/RoomShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { FEARLESS_LABEL, LANES, LANE_LABEL_KO } from "@/lib/constants";
import { LaneTag } from "@/components/ui/LaneTag";
import { fetchGuests, fetchRoomMembers } from "@/lib/api/rooms";
import { fetchPlayers } from "@/lib/api/players";
import {
  createSession,
  fetchSessions,
  type SessionRosterMemberInput,
} from "@/lib/api/sessions";
import type {
  FearlessMode,
  GroupGuest,
  Lane,
  MatchFormat,
  ParticipantType,
  Player,
  RoomMember,
  ScrimSession,
  SessionStatus,
  Side,
} from "@/types";

const STATUS_LABEL: Record<SessionStatus, string> = {
  PREPARING: "준비 중",
  PROPOSED: "수락 대기",
  CONFIRMED: "확정",
  IN_PROGRESS: "진행 중",
  FINISHED: "종료",
  CANCELLED: "취소됨",
};

const MATCH_FORMAT_LABEL: Record<MatchFormat, string> = {
  BEST_OF_3: "3판 2선승",
  BEST_OF_5: "5판 3선승",
  UNLIMITED: "제한 없음",
};

type RosterSelections = Record<Side, Record<Lane, string>>;

function emptyRoster(): RosterSelections {
  return {
    BLUE: { TOP: "", JUNGLE: "", MID: "", ADC: "", SUPPORT: "" },
    RED: { TOP: "", JUNGLE: "", MID: "", ADC: "", SUPPORT: "" },
  };
}

export default function SessionsPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = Number(params.roomId);
  const { room } = useRoom();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ScrimSession[]>([]);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [guests, setGuests] = useState<GroupGuest[]>([]);
  const [riotPlayers, setRiotPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [matchFormat, setMatchFormat] = useState<MatchFormat>("BEST_OF_3");
  const [fearlessMode, setFearlessMode] = useState<FearlessMode>("NONE");
  const [ratingEnabled, setRatingEnabled] = useState(true);
  const [creatorSide, setCreatorSide] = useState<Side>("BLUE");
  const [opponentCaptainUserId, setOpponentCaptainUserId] = useState("");
  const [roster, setRoster] = useState<RosterSelections>(emptyRoster);

  useEffect(() => {
    let active = true;
    fetchSessions(roomId)
      .then((loadedSessions) => {
        if (!active) return;
        setSessions(loadedSessions);
        setError(null);
      })
      .catch((caught) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "세션을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [roomId]);

  const activeSession = sessions.find((session) =>
    ["PREPARING", "PROPOSED", "CONFIRMED", "IN_PROGRESS"].includes(
      session.status,
    ),
  );
  const canManage = room.myRole === "GROUP_OWNER" || room.myRole === "GROUP_MANAGER";

  const participants = useMemo(
    () => [
      ...members.map((member) => ({
        key: `MEMBER:${member.user.id}`,
        name: member.user.displayName,
        kind: "회원",
        primaryLane: member.player?.primaryLane ?? null,
        secondaryLane: member.player?.secondaryLane ?? null,
      })),
      ...guests
        .filter((guest) => guest.active && !guest.banned)
        .map((guest) => ({
          key: `GUEST:${guest.id}`,
          name: guest.nickname,
          kind: "게스트",
          primaryLane: null,
          secondaryLane: null,
        })),
      ...riotPlayers
        .filter((player) => player.isActive && player.memberUserId === null)
        .map((player) => ({
          key: `PLAYER:${player.id}`,
          name: player.riotAccount
            ? `${player.riotAccount.gameName}#${player.riotAccount.tagLine}`
            : player.displayName,
          kind: "Riot ID",
          primaryLane: player.primaryLane,
          secondaryLane: player.secondaryLane,
        })),
    ],
    [guests, members, riotPlayers],
  );

  async function openCreate() {
    try {
      setError(null);
      const [loadedMembers, loadedGuests, loadedPlayers] = await Promise.all([
        fetchRoomMembers(roomId),
        canManage ? fetchGuests(roomId) : Promise.resolve([]),
        fetchPlayers(roomId),
      ]);
      setMembers(loadedMembers);
      setGuests(loadedGuests);
      setRiotPlayers(loadedPlayers);
      const firstOpponent = loadedMembers.find((member) => member.user.id !== user?.id);
      setOpponentCaptainUserId(firstOpponent ? String(firstOpponent.user.id) : "");
      setShowCreate(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "참가자를 불러오지 못했습니다.");
    }
  }

  function updateRoster(side: Side, lane: Lane, value: string) {
    setRoster((current) => ({
      ...current,
      [side]: { ...current[side], [lane]: value },
    }));
  }

  function toTeam(side: Side): SessionRosterMemberInput[] {
    return LANES.map((lane) => {
      const [participantType, id] = roster[side][lane].split(":");
      return {
        participantType: participantType as ParticipantType,
        participantId: Number(id),
        lane,
      };
    });
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selected = [...Object.values(roster.BLUE), ...Object.values(roster.RED)];
    if (selected.some((value) => !value)) {
      setError("양 팀의 모든 라인에 참가자를 선택해 주세요.");
      return;
    }
    if (new Set(selected).size !== 10) {
      setError("한 참가자를 여러 라인에 중복 배치할 수 없습니다.");
      return;
    }
    if (!opponentCaptainUserId) {
      setError("참가자 중 상대 팀장을 선택해 주세요.");
      return;
    }

    try {
      setSaving(true);
      const created = await createSession(roomId, {
        name,
        matchFormat,
        fearlessMode,
        ratingEnabled,
        creatorSide,
        opponentCaptainUserId: Number(opponentCaptainUserId),
        blueTeam: toTeam("BLUE"),
        redTeam: toTeam("RED"),
      });
      setSessions((current) => [created, ...current]);
      setShowCreate(false);
      setRoster(emptyRoster());
      setName("");
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "세션을 제안하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="px-8 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">세션</p>
          <h1 className="text-xl font-semibold tracking-tight">세션 목록</h1>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
            두 팀의 5인 로스터와 기본 라인은 세션 확정 후 고정됩니다. 한 그룹에서는
            준비하거나 진행 중인 세션을 하나만 운영할 수 있습니다.
          </p>
        </div>
        {user && (
          <Button
            variant="primary"
            size="sm"
            disabled={Boolean(activeSession)}
            onClick={() => void openCreate()}
          >
            {activeSession ? "활성 세션 있음" : "세션 제안"}
          </Button>
        )}
      </div>

      {error && <p className="mb-5 text-sm text-loss">{error}</p>}

      {showCreate && (
        <Card className="mb-8">
          <CardHeader eyebrow="session-v1" title="새 세션 제안" />
          <form onSubmit={handleCreate} className="space-y-6 px-5 py-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="text-xs text-muted">
                세션 이름
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  placeholder="금요일 정기 내전"
                  className="mt-2 h-10 w-full rounded-md border border-line bg-bg px-3 text-sm text-text"
                />
              </label>
              <label className="text-xs text-muted">
                경기 방식
                <select
                  value={matchFormat}
                  onChange={(event) => setMatchFormat(event.target.value as MatchFormat)}
                  className="mt-2 h-10 w-full rounded-md border border-line bg-bg px-3 text-sm text-text"
                >
                  {Object.entries(MATCH_FORMAT_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-muted">
                피어리스 방식
                <select
                  value={fearlessMode}
                  onChange={(event) => setFearlessMode(event.target.value as FearlessMode)}
                  className="mt-2 h-10 w-full rounded-md border border-line bg-bg px-3 text-sm text-text"
                >
                  {Object.entries(FEARLESS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-muted">
                내 진영
                <select
                  value={creatorSide}
                  onChange={(event) => setCreatorSide(event.target.value as Side)}
                  className="mt-2 h-10 w-full rounded-md border border-line bg-bg px-3 text-sm text-text"
                >
                  <option value="BLUE">BLUE</option>
                  <option value="RED">RED</option>
                </select>
              </label>
              <label className="text-xs text-muted">
                상대 팀장
                <select
                  value={opponentCaptainUserId}
                  onChange={(event) => setOpponentCaptainUserId(event.target.value)}
                  className="mt-2 h-10 w-full rounded-md border border-line bg-bg px-3 text-sm text-text"
                  required
                >
                  <option value="">회원 선택</option>
                  {members.filter((member) => member.user.id !== user?.id).map((member) => <option key={member.user.id} value={member.user.id}>{member.user.displayName}</option>)}
                </select>
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={ratingEnabled}
                onChange={(event) => setRatingEnabled(event.target.checked)}
              />
              결과를 그룹 점수에 반영
            </label>

            <div className="grid gap-6 lg:grid-cols-2">
              {(["BLUE", "RED"] as Side[]).map((side) => (
                <div key={side}>
                  <div className="mb-3 flex items-center gap-2">
                    <Badge tone={side === "BLUE" ? "blue" : "red"}>{side}</Badge>
                    <span className="text-xs text-dim">
                      팀장 {side === creatorSide ? user?.displayName : members.find((member) => String(member.user.id) === opponentCaptainUserId)?.user.displayName ?? "선택 필요"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {LANES.map((lane) => (
                      <label key={lane} className="grid grid-cols-[72px_1fr] items-center gap-3 text-xs text-muted">
                        <span><LaneTag lane={lane} /></span>
                        <select
                          value={roster[side][lane]}
                          onChange={(event) => updateRoster(side, lane, event.target.value)}
                          className="h-10 rounded-md border border-line bg-bg px-3 text-sm text-text"
                        >
                          <option value="">참가자 선택</option>
                          {participants.map((participant) => (
                            <option key={participant.key} value={participant.key}>
                              {participant.name} · {participant.kind}{participant.primaryLane ? ` · 주 ${LANE_LABEL_KO[participant.primaryLane]}` : ""}{participant.secondaryLane ? ` / 부 ${LANE_LABEL_KO[participant.secondaryLane]}` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 border-t border-line-soft pt-4">
              <Button type="button" size="sm" onClick={() => setShowCreate(false)}>
                취소
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={saving || participants.length < 10}>
                {saving ? "제안 중…" : participants.length < 10 ? `${10 - participants.length}명 더 필요` : "상대 팀장에게 제안"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-muted">세션을 불러오는 중…</p>
      ) : sessions.length === 0 ? (
        <Card className="px-5 py-12 text-center">
          <p className="text-sm text-muted">아직 생성된 세션이 없습니다.</p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link
                href={`/rooms/${room.id}/sessions/${session.id}`}
                className="flex flex-wrap items-center gap-4 rounded-[10px] border border-line bg-surface px-5 py-4 transition-colors hover:border-dim"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-medium">
                      {session.name ?? "이름 없는 세션"}
                    </span>
                    <Badge tone={session.status === "IN_PROGRESS" ? "gain" : "neutral"}>
                      {STATUS_LABEL[session.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-dim">
                    {new Date(session.createdAt).toLocaleString("ko-KR")}
                  </p>
                </div>
                <Badge tone={session.fearlessMode === "NONE" ? "neutral" : "gold"}>
                  {FEARLESS_LABEL[session.fearlessMode]}
                </Badge>
                <span className="text-xs text-muted">{MATCH_FORMAT_LABEL[session.matchFormat]}</span>
                {!session.ratingEnabled && <Badge tone="quiet">점수 미반영</Badge>}
                <div className="text-right">
                  <p className="tabular text-sm">{session.gameCount}</p>
                  <p className="eyebrow mt-0.5">매치</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
