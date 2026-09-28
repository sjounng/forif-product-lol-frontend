"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Dialog, TextPromptDialog } from "@/components/ui/Dialog";
import { championSquareUrl } from "@/lib/champion-art";
import { FEARLESS_DESCRIPTION, FEARLESS_LABEL } from "@/lib/constants";
import { LaneTag } from "@/components/ui/LaneTag";
import { TeamBoard } from "@/components/session/TeamBoard";
import {
  fetchMatchOverview,
  finishUnlimitedSession,
  proposeMatchResult,
  requestMatchStart,
  respondToMatchResult,
  respondToMatchStart,
  startMatch,
} from "@/lib/api/matches";
import {
  acceptSession,
  cancelSession,
  fetchSession,
  rejectSession,
  renameSessionTeam,
} from "@/lib/api/sessions";
import type {
  MatchFormat,
  MatchOverview,
  MatchParticipantStats,
  MatchStatus,
  ScrimSession,
  SessionMatch,
  SessionStatus,
  Side,
} from "@/types";

type KdaField = "kills" | "deaths" | "assists";
type KdaDraft = Record<number, Record<KdaField, string>>;
const KDA_MAX_DIGITS = 5;

const STATUS_LABEL: Record<SessionStatus, string> = {
  PREPARING: "준비 중",
  PROPOSED: "상대 팀장 수락 대기",
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

const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  SCHEDULED: "예정",
  PROPOSED: "시작 제안",
  ACCEPTED: "시작 수락",
  DRAFTING: "Draft 준비",
  READY_TO_PLAY: "경기 시작 대기",
  LIVE: "경기 중",
  RESULT_PENDING: "결과 확인 대기",
  RESULT_DISPUTED: "결과 분쟁",
  COMPLETED: "완료",
  CANCELLED: "취소",
  VOIDED: "무효",
};

export default function SessionDetailPage() {
  const params = useParams<{ roomId: string; sessionId: string }>();
  const roomId = Number(params.roomId);
  const sessionId = Number(params.sessionId);
  const [session, setSession] = useState<ScrimSession | null>(null);
  const [overview, setOverview] = useState<MatchOverview | null>(null);
  const [reason, setReason] = useState("");
  const [blueTeamSide, setBlueTeamSide] = useState<Side>("BLUE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultEntry, setResultEntry] = useState<{
    matchId: number;
    winnerSide: Side;
  } | null>(null);
  const [kdaDraft, setKdaDraft] = useState<KdaDraft>({});
  const [resultConfirmation, setResultConfirmation] = useState<{
    match: SessionMatch;
    participantStats: MatchParticipantStats[];
    winnerName: string;
    winnerSide: Side;
  } | null>(null);
  const [renameSide, setRenameSide] = useState<Side | null>(null);
  const [teamNameDraft, setTeamNameDraft] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([fetchSession(sessionId), fetchMatchOverview(sessionId)])
      .then(([loadedSession, loadedOverview]) => {
        if (!active) return;
        setSession(loadedSession);
        setOverview(loadedOverview);
        setError(null);
      })
      .catch((caught) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "세션을 불러오지 못했습니다.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [sessionId]);

  async function refresh() {
    const [loadedSession, loadedOverview] = await Promise.all([
      fetchSession(sessionId),
      fetchMatchOverview(sessionId),
    ]);
    setSession(loadedSession);
    setOverview(loadedOverview);
  }

  async function runAction(action: () => Promise<unknown>) {
    try {
      setSaving(true);
      setError(null);
      await action();
      await refresh();
      return true;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "요청을 처리하지 못했습니다.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  function mutateSession(action: "accept" | "reject" | "cancel") {
    return runAction(() =>
      action === "accept"
        ? acceptSession(sessionId)
        : action === "reject"
          ? rejectSession(sessionId, reason)
          : cancelSession(sessionId),
    );
  }

  function openResultEntry(match: SessionMatch, winnerSide: Side) {
    if (resultEntry?.matchId === match.id) {
      if (resultEntry.winnerSide === winnerSide) {
        setResultEntry(null);
        setKdaDraft({});
        return;
      }
      setResultEntry({ matchId: match.id, winnerSide });
      return;
    }

    setResultEntry({ matchId: match.id, winnerSide });
    setKdaDraft(
      Object.fromEntries(
        (match.participants ?? []).map((participant) => [
          participant.playerId,
          {
            kills: "",
            deaths: "",
            assists: "",
          },
        ]),
      ),
    );
  }

  function updateKda(playerId: number, field: KdaField, value: string) {
    if (!/^\d{0,5}$/.test(value)) return;
    setKdaDraft((current) => ({
      ...current,
      [playerId]: { ...current[playerId], [field]: value },
    }));
  }

  function moveKdaFocus(input: HTMLInputElement, offset: number) {
    const grid = input.closest<HTMLElement>("[data-kda-grid]");
    const inputs = Array.from(
      grid?.querySelectorAll<HTMLInputElement>("[data-kda-input]") ?? [],
    );
    const target = inputs[inputs.indexOf(input) + offset];
    if (!target) return;
    target.focus();
    target.select();
  }

  function advanceKdaAtLimit(input: HTMLInputElement) {
    if (input.value.length === KDA_MAX_DIGITS) moveKdaFocus(input, 1);
  }

  function handleKdaKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const offset =
      event.key === "ArrowLeft"
        ? -1
        : event.key === "ArrowRight" || event.key === "Enter"
          ? 1
          : event.key === "ArrowUp"
            ? -3
            : event.key === "ArrowDown"
              ? 3
              : null;
    if (offset === null) return;
    event.preventDefault();
    moveKdaFocus(event.currentTarget, offset);
  }

  async function submitResult(match: SessionMatch) {
    if (!resultEntry || resultEntry.matchId !== match.id) return;
    if ((match.participants ?? []).length !== 10) {
      setError("드래프트가 완료된 참가자 10명의 전적만 입력할 수 있습니다.");
      return;
    }
    const participantStats: MatchParticipantStats[] = (match.participants ?? []).map(
      (participant) => {
        const draft = kdaDraft[participant.playerId];
        return {
          playerId: participant.playerId,
          kills: draft?.kills ? Number(draft.kills) : Number.NaN,
          deaths: draft?.deaths ? Number(draft.deaths) : Number.NaN,
          assists: draft?.assists ? Number(draft.assists) : Number.NaN,
        };
      },
    );
    if (
      participantStats.some((stats) =>
        [stats.kills, stats.deaths, stats.assists].some(
          (value) => !Number.isInteger(value) || value < 0 || value > 65535,
        ),
      )
    ) {
      setError("K/D/A를 0 이상의 정수로 모두 입력해 주세요.");
      return;
    }
    const winnerName =
      resultEntry.winnerSide === "BLUE"
        ? match.blueTeamName
        : match.redTeamName;
    setResultConfirmation({ match, participantStats, winnerName, winnerSide: resultEntry.winnerSide });
  }

  async function confirmResult() {
    if (!resultConfirmation) return;
    const succeeded = await runAction(() =>
      proposeMatchResult(
        resultConfirmation.match.id,
        resultConfirmation.winnerSide,
        resultConfirmation.participantStats,
      ),
    );
    if (succeeded) {
      setResultEntry(null);
      setResultConfirmation(null);
    } else {
      setResultConfirmation(null);
    }
  }

  if (loading) {
    return (
      <main className="px-8 py-16 text-center text-sm text-muted">
        세션을 불러오는 중…
      </main>
    );
  }
  if (!session || !overview) {
    return (
      <main className="px-8 py-16 text-center text-sm text-loss">
        {error ?? "세션을 찾을 수 없습니다."}
      </main>
    );
  }

  const viewerIsCaptain = session.viewer.captainSide !== null;
  const sessionBlueTeam = session.teams.find((team) => team.side === "BLUE");
  const sessionRedTeam = session.teams.find((team) => team.side === "RED");

  function renameMyTeam(side: Side) {
    const team = side === "BLUE" ? sessionBlueTeam : sessionRedTeam;
    if (!team) return;
    setTeamNameDraft(team.teamName);
    setRenameSide(side);
  }

  async function confirmTeamRename() {
    const nextName = teamNameDraft.trim();
    if (!renameSide || !nextName) return;
    await runAction(() => renameSessionTeam(sessionId, nextName));
    setRenameSide(null);
  }

  function matchWinnerName(match: SessionMatch, side: Side) {
    return side === "BLUE" ? match.blueTeamName : match.redTeamName;
  }

  return (
    <main className="px-8 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <Link
            href={`/rooms/${roomId}/sessions`}
            className="section-label hover:text-text"
          >
            ← 세션 목록
          </Link>
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">
              {session.name ?? "이름 없는 세션"}
            </h1>
            <Badge
              tone={session.status === "IN_PROGRESS" ? "gain" : "neutral"}
            >
              {STATUS_LABEL[session.status]}
            </Badge>
          </div>
          <p className="mt-2 text-xs text-dim">
            {MATCH_FORMAT_LABEL[session.matchFormat]} ·{" "}
            {session.ratingEnabled ? "점수 반영" : "점수 미반영"}
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-lg border border-line bg-surface px-5 py-3">
          <div className="text-center">
            <p className="max-w-36 truncate text-xs font-medium text-text">
              {sessionBlueTeam?.teamName ?? "BLUE 팀"}
            </p>
            <p className="tabular mt-1 text-2xl font-semibold">
              {overview.score.blueWins}
            </p>
          </div>
          <span className="text-sm text-dim">:</span>
          <div className="text-center">
            <p className="max-w-36 truncate text-xs font-medium text-text">
              {sessionRedTeam?.teamName ?? "RED 팀"}
            </p>
            <p className="tabular mt-1 text-2xl font-semibold">
              {overview.score.redWins}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-5 text-sm text-loss">
          {error}
        </p>
      )}

      {session.viewer.canReview && (
        <Card className="mb-6 border-gold/30">
          <CardHeader eyebrow="팀장 합의" title="세션 제안을 검토해 주세요" />
          <div className="space-y-4 px-5 py-5">
            <p className="text-sm text-muted">
              수락하면 양 팀 구성, 기본 라인, 경기 방식과 피어리스 규칙이
              확정됩니다.
            </p>
            <label className="block text-xs text-muted">
              거절 사유 (선택)
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={500}
                className="mt-2 h-10 w-full rounded-md border border-line bg-bg px-3 text-sm text-text"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button
                variant="danger"
                size="sm"
                disabled={saving}
                onClick={() => void mutateSession("reject")}
              >
                거절
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={saving}
                onClick={() => void mutateSession("accept")}
              >
                제안 수락
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-6 grid min-w-0 gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader eyebrow="규칙" title="세션 설정" />
          <dl className="space-y-4 px-5 py-5 text-sm">
            <div>
              <dt className="section-label mb-1">경기 방식</dt>
              <dd>{MATCH_FORMAT_LABEL[session.matchFormat]}</dd>
            </div>
            <div>
              <dt className="section-label mb-1">피어리스</dt>
              <dd>{FEARLESS_LABEL[session.fearlessMode]}</dd>
              <p className="mt-1 text-xs text-dim">
                {FEARLESS_DESCRIPTION[session.fearlessMode]}
              </p>
            </div>
            <div>
              <dt className="section-label mb-1">완료 매치</dt>
              <dd className="tabular">{session.gameCount}</dd>
            </div>
          </dl>
        </Card>

        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          {(["BLUE", "RED"] as Side[]).map((side) => {
            const team = session.teams.find((value) => value.side === side);
            return (
              <TeamBoard
                key={side}
                side={side}
                team={team}
                canRename={session.viewer.captainSide === side}
                saving={saving}
                onRename={() => renameMyTeam(side)}
              />
            );
          })}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader
          eyebrow="match-v1"
          mono
          title="경기 전적"
          action={
            <div className="flex flex-wrap justify-end gap-2">
              {overview.canRequestStart && (
                <div className="flex items-center gap-2">
                  <div className="grid min-w-56 grid-cols-[auto_1fr] items-center gap-2 rounded-md border border-line bg-bg pl-3 text-sm text-muted">
                    <span className="whitespace-nowrap">BLUE 진영</span>
                    <Select
                      value={blueTeamSide}
                      disabled={saving}
                      onChange={(value) => setBlueTeamSide(value as Side)}
                      options={[
                        { value: "BLUE", label: sessionBlueTeam?.teamName ?? "BLUE 팀" },
                        { value: "RED", label: sessionRedTeam?.teamName ?? "RED 팀" },
                      ]}
                      ariaLabel="BLUE 진영 팀"
                      className="[&>button]:h-9 [&>button]:border-0 [&>button]:bg-transparent"
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={saving}
                    onClick={() =>
                      void runAction(() => requestMatchStart(sessionId, blueTeamSide))
                    }
                  >
                    이 진영으로 시작 요청
                  </Button>
                </div>
              )}
              {overview.canFinishSession && (
                <Button
                  variant="danger"
                  size="sm"
                  disabled={saving}
                  onClick={() =>
                    void runAction(() => finishUnlimitedSession(sessionId))
                  }
                >
                  세션 종료
                </Button>
              )}
            </div>
          }
        />

        {overview.pendingStartRequest && (
          <div className="border-b border-line-soft bg-gold/5 px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {overview.pendingStartRequest.gameNo}경기 시작 합의 대기
                </p>
                <p className="mt-1 text-xs text-dim">
                  {overview.pendingStartRequest.proposedBy.displayName} 팀장이
                  요청했습니다. · BLUE {overview.pendingStartRequest.blueTeamName} / RED{" "}
                  {overview.pendingStartRequest.redTeamName}
                </p>
              </div>
              {overview.pendingStartRequest.canReview && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={saving}
                    onClick={() =>
                      void runAction(() =>
                        respondToMatchStart(
                          overview.pendingStartRequest!.id,
                          "reject",
                        ),
                      )
                    }
                  >
                    거절
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={saving}
                    onClick={() =>
                      void runAction(() =>
                        respondToMatchStart(
                          overview.pendingStartRequest!.id,
                          "accept",
                        ),
                      )
                    }
                  >
                    시작 수락
                  </Button>
                </>
              )}
              {overview.pendingStartRequest.canCancel && (
                <Button
                  size="sm"
                  disabled={saving}
                  onClick={() =>
                    void runAction(() =>
                      respondToMatchStart(
                        overview.pendingStartRequest!.id,
                        "cancel",
                      ),
                    )
                  }
                >
                  요청 취소
                </Button>
              )}
            </div>
          </div>
        )}

        {overview.matches.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            아직 생성된 매치가 없습니다. 세션 확정 후 한 팀장이 시작을
            요청하고 상대 팀장이 수락해야 합니다.
          </p>
        ) : (
          <ul>
            {overview.matches.map((match) => (
              <li
                key={match.id}
                className="border-b border-line-soft px-5 py-4 last:border-b-0"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {match.gameNo}경기
                      </span>
                      <Badge
                        tone={
                          match.status === "LIVE"
                            ? "gain"
                            : match.status === "RESULT_DISPUTED"
                              ? "red"
                              : "neutral"
                        }
                      >
                        {MATCH_STATUS_LABEL[match.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-dim">
                      {match.status === "COMPLETED" && match.winnerSide
                        ? `${matchWinnerName(match, match.winnerSide)} 승리`
                        : match.status === "RESULT_PENDING" &&
                            match.proposedWinnerSide
                          ? `${matchWinnerName(match, match.proposedWinnerSide)} 승리 확인 대기`
                          : match.draftId
                            ? `Draft #${match.draftId} 생성 완료`
                            : "Draft 생성 대기"}
                    </p>
                    <p className="mt-1 text-[10px] text-dim">
                      BLUE {match.blueTeamName} · RED {match.redTeamName}
                    </p>
                  </div>

                  {match.status === "DRAFTING" && match.draftId && (
                    <Link
                      href={`/draft/${match.draftId}`}
                      className="border border-gold px-3 py-2 text-xs font-semibold text-gold hover:bg-gold hover:text-bg"
                    >
                      밴픽 입장
                    </Link>
                  )}
                  {match.status === "READY_TO_PLAY" && viewerIsCaptain && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={saving}
                      onClick={() =>
                        void runAction(() => startMatch(match.id))
                      }
                    >
                      경기 시작
                    </Button>
                  )}
                  {match.canProposeResult && (
                    <>
                      <Button
                        size="sm"
                        variant={
                          resultEntry?.matchId === match.id &&
                          resultEntry.winnerSide === "BLUE"
                            ? "primary"
                            : undefined
                        }
                        aria-pressed={
                          resultEntry?.matchId === match.id &&
                          resultEntry.winnerSide === "BLUE"
                        }
                        disabled={saving}
                        onClick={() => openResultEntry(match, "BLUE")}
                      >
                        {match.blueTeamName} 승리 제안
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          resultEntry?.matchId === match.id &&
                          resultEntry.winnerSide === "RED"
                            ? "primary"
                            : undefined
                        }
                        aria-pressed={
                          resultEntry?.matchId === match.id &&
                          resultEntry.winnerSide === "RED"
                        }
                        disabled={saving}
                        onClick={() => openResultEntry(match, "RED")}
                      >
                        {match.redTeamName} 승리 제안
                      </Button>
                    </>
                  )}
                  {match.canReviewResult && (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={saving}
                        onClick={() =>
                          void runAction(() =>
                            respondToMatchResult(match.id, "reject"),
                          )
                        }
                      >
                        결과 거절
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={saving}
                        onClick={() =>
                          void runAction(() =>
                            respondToMatchResult(match.id, "accept"),
                          )
                        }
                      >
                        결과 확인
                      </Button>
                    </>
                  )}
                </div>
                {(match.draftActions ?? []).length > 0 && (
                  <MatchDraftHistory match={match} />
                )}
                {(match.participants ?? []).length > 0 && (
                  <MatchRosterHistory match={match} />
                )}
                {resultEntry?.matchId === match.id && (
                  <div id={`match-result-entry-${match.id}`} className="mt-4 rounded-lg border border-gold/30 bg-bg/70 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">KDA 입력</p>
                        <p className="mt-1 text-xs text-dim">
                          {resultEntry.winnerSide === "BLUE"
                            ? match.blueTeamName
                            : match.redTeamName} 승리 · 참가자 10명의 K/D/A
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-muted hover:text-text"
                        onClick={() => {
                          setResultEntry(null);
                          setKdaDraft({});
                        }}
                      >
                        닫기
                      </button>
                    </div>
                    <div data-kda-grid className="grid gap-x-6 gap-y-2 lg:grid-cols-2">
                      {(["BLUE", "RED"] as Side[]).flatMap((side) =>
                        (match.participants ?? [])
                          .filter((participant) => participant.side === side)
                          .map((participant) => (
                            <div
                              key={participant.playerId}
                              className="grid grid-cols-[minmax(0,1fr)_48px_48px_48px] items-center gap-2"
                            >
                              <span className="truncate text-xs text-muted">
                                {participant.displayName}
                              </span>
                              {(["kills", "deaths", "assists"] as KdaField[]).map(
                                (field) => (
                                  <label key={field} className="block">
                                    <span className="sr-only">
                                      {participant.displayName} {field}
                                    </span>
                                    <input
                                      data-kda-input
                                      inputMode="numeric"
                                      value={kdaDraft[participant.playerId]?.[field] ?? ""}
                                      onChange={(event) => {
                                        updateKda(
                                          participant.playerId,
                                          field,
                                          event.currentTarget.value,
                                        );
                                        advanceKdaAtLimit(event.currentTarget);
                                      }}
                                      onKeyDown={handleKdaKeyDown}
                                      maxLength={KDA_MAX_DIGITS}
                                      placeholder={field[0].toUpperCase()}
                                      className="tabular h-8 w-full rounded border border-line bg-surface px-1 text-center text-xs outline-none focus:border-gold"
                                    />
                                  </label>
                                ),
                              )}
                            </div>
                          )),
                      )}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={saving}
                        onClick={() => void submitResult(match)}
                      >
                        KDA와 경기 결과 제안
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {session.status === "CANCELLED" && session.rejectionReason && (
        <Card className="mb-6 px-5 py-4">
          <p className="section-label mb-1">거절 사유</p>
          <p className="text-sm text-muted">{session.rejectionReason}</p>
        </Card>
      )}

      {resultEntry && (
        <button
          type="button"
          aria-label="KDA 입력 영역으로 이동"
          aria-controls={`match-result-entry-${resultEntry.matchId}`}
          title="아래에서 KDA와 경기 결과를 입력해 주세요"
          className="fixed bottom-6 left-1/2 z-50 grid size-12 -translate-x-1/2 place-items-center rounded-full border border-gold/60 bg-surface/95 text-gold shadow-[0_10px_32px_rgba(0,0,0,0.4)] backdrop-blur transition-colors hover:bg-raised"
          onClick={() =>
            document
              .getElementById(`match-result-entry-${resultEntry.matchId}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-6 animate-bounce"
            fill="none"
          >
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <div className="flex items-center justify-between border-t border-line-soft pt-5">
        <p className="text-xs text-dim">
          매치는 한 팀장이 시작을 요청하고 상대 팀장이 수락해야 생성됩니다.
          결과도 같은 방식으로 상대 팀장의 확인을 거쳐 확정됩니다.
        </p>
        {session.viewer.canCancel && (
          <Button
            variant="danger"
            size="sm"
            disabled={saving}
            onClick={() => void mutateSession("cancel")}
          >
            세션 취소
          </Button>
        )}
      </div>
      <Dialog
        open={resultConfirmation !== null}
        title="경기 결과를 제안할까요?"
        description={resultConfirmation ? `${resultConfirmation.match.gameNo}경기를 ${resultConfirmation.winnerName} 승리로 제안합니다. 양 팀의 확인 후 전적에 반영됩니다.` : undefined}
        confirmLabel="결과 제안"
        pending={saving}
        onClose={() => setResultConfirmation(null)}
        onConfirm={() => void confirmResult()}
      />
      <TextPromptDialog
        open={renameSide !== null}
        title="팀 이름 변경"
        description="세션과 경기 전적에 표시할 팀 이름을 입력해 주세요."
        value={teamNameDraft}
        onValueChange={setTeamNameDraft}
        maxLength={30}
        pending={saving}
        onClose={() => setRenameSide(null)}
        onConfirm={() => void confirmTeamRename()}
      />
    </main>
  );
}

function MatchDraftHistory({ match }: { match: SessionMatch }) {
  const actions = [...(match.draftActions ?? [])].sort(
    (left, right) => left.stepNo - right.stepNo,
  );
  const rounds = actions.reduce<(typeof actions)[]>((result, action) => {
    const current = result.at(-1);
    if (!current || current[0]?.actionType !== action.actionType) {
      result.push([action]);
    } else {
      current.push(action);
    }
    return result;
  }, []);
  const participantNames = new Map(
    (match.participants ?? []).map((participant) => [
      participant.playerId,
      participant.displayName,
    ]),
  );

  return (
    <section className="mt-4 border-t border-line-soft pt-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium">밴픽 기록</p>
          <p className="mt-1 text-[10px] text-dim">
            실제 진행 순서 · {actions.length}개 액션
          </p>
        </div>
        <span className="text-[10px] text-dim">BAN은 회색으로 표시됩니다</span>
      </div>

      <div className="space-y-3">
        {rounds.map((round, roundIndex) => (
          <div key={`${round[0]?.actionType}-${roundIndex}`}>
            <p className="mb-1.5 text-[9px] font-semibold tracking-[0.16em] text-muted">
              {round[0]?.actionType === "BAN" ? "BAN PHASE" : "PICK PHASE"}
            </p>
            <div className="overflow-x-auto pb-1">
              <ol className="flex min-w-max gap-2">
                {round.map((action) => {
                  const playerName = action.playerId
                    ? participantNames.get(action.playerId)
                    : null;
                  const isBan = action.actionType === "BAN";
                  return (
                    <li
                      key={action.stepNo}
                      className={`w-20 shrink-0 overflow-hidden rounded border bg-bg/70 ${
                        action.side === "BLUE" ? "border-blue/45" : "border-red/45"
                      }`}
                      title={`${action.stepNo}. ${action.side} ${action.actionType} ${action.champion?.nameKo ?? "미선택"}`}
                    >
                      <div className="relative size-20 overflow-hidden bg-black">
                        {action.champion ? (
                          <Image
                            src={championSquareUrl(action.champion.riotId, action.champion.imageUrl)}
                            alt={action.champion.nameKo}
                            fill
                            sizes="80px"
                            className={`object-cover ${isBan ? "grayscale" : ""}`}
                          />
                        ) : (
                          <span className="grid h-full place-items-center text-[10px] text-dim">
                            미선택
                          </span>
                        )}
                        <span className="tabular absolute left-1 top-1 rounded bg-black/75 px-1 py-0.5 text-[8px] text-white">
                          {action.stepNo}
                        </span>
                        <span
                          className={`absolute bottom-1 right-1 rounded bg-black/75 px-1 py-0.5 text-[8px] font-semibold ${
                            action.side === "BLUE" ? "text-blue" : "text-red"
                          }`}
                        >
                          {action.side}
                        </span>
                      </div>
                      <div className="px-2 py-1.5">
                        <p className="truncate text-[10px] font-medium text-text">
                          {action.champion?.nameKo ?? "미선택"}
                        </p>
                        <p className="mt-0.5 truncate text-[8px] text-dim">
                          {isBan ? "BAN" : playerName ?? "PICK"}
                          {action.auto ? " · 자동" : ""}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MatchRosterHistory({ match }: { match: SessionMatch }) {
  const participants = match.participants ?? [];
  return (
    <div className="mt-4 grid gap-3 border-t border-line-soft pt-4 lg:grid-cols-2">
      {(["BLUE", "RED"] as Side[]).map((side) => {
        const teamName = side === "BLUE" ? match.blueTeamName : match.redTeamName;
        const won = match.winnerSide === side;
        return (
          <section
            key={side}
            className={`overflow-hidden rounded-lg border ${
              won ? "border-gold/45 bg-gold/5" : "border-line bg-surface/45"
            }`}
          >
            <div className="flex items-center justify-between border-b border-line-soft px-3 py-2">
              <p className="truncate text-xs font-medium">{teamName}</p>
              <span className={side === "BLUE" ? "text-[10px] text-blue" : "text-[10px] text-red"}>
                {side}{won ? " · 승리" : ""}
              </span>
            </div>
            <ul>
              {participants
                .filter((participant) => participant.side === side)
                .map((participant) => {
                  const hasKda =
                    participant.kills !== null &&
                    participant.deaths !== null &&
                    participant.assists !== null;
                  return (
                    <li
                      key={participant.playerId}
                      className="grid grid-cols-[40px_58px_minmax(0,1fr)_92px] items-center gap-2 border-b border-line-soft px-3 py-2 last:border-b-0"
                    >
                      <div className="relative size-10 overflow-hidden rounded border border-line bg-bg">
                        {participant.champion ? (
                          <Image
                            src={championSquareUrl(participant.champion.riotId, participant.champion.imageUrl)}
                            alt={participant.champion.nameKo}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="grid h-full place-items-center text-[10px] text-dim">—</span>
                        )}
                      </div>
                      <LaneTag lane={participant.lane} />
                      <div className="min-w-0">
                        <p className="truncate text-xs text-text">{participant.displayName}</p>
                        <p className="mt-0.5 truncate text-[10px] text-dim">
                          {participant.champion?.nameKo ?? "챔피언 미확정"}
                        </p>
                      </div>
                      <p className="tabular text-right text-xs text-muted">
                        {hasKda
                          ? `${participant.kills} / ${participant.deaths} / ${participant.assists}`
                          : "KDA 미입력"}
                      </p>
                    </li>
                  );
                })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
