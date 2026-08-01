"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChampionGrid, type DraftChampion } from "@/components/draft/ChampionGrid";
import {
  DraftRail,
  type LockedChampion,
  type PickSlot,
} from "@/components/draft/DraftRail";
import {
  assignDraftChampion,
  connectDraftSocket,
  confirmDraftAssignment,
  fetchChampions,
  fetchDraft,
  hoverDraft,
  lockDraft,
  readyDraft,
  type DraftSocketCommand,
} from "@/lib/api/drafts";
import { getChampionLanes } from "@/lib/champion-lanes";
import { LANES, LANE_LABEL } from "@/lib/constants";
import { LaneIcon } from "@/components/ui/LaneIcon";
import { LaneTag } from "@/components/ui/LaneTag";
import type {
  Champion,
  DraftChampionSummary,
  DraftRealtimeEvent,
  DraftState,
  Lane,
  Side,
} from "@/types";
import Image from "next/image";

type RoleFilter = Lane | "ALL";

const STATUS_LABEL: Record<DraftState["status"], string> = {
  WAITING: "READY 대기",
  READY: "상대 READY 대기",
  IN_PROGRESS: "밴픽 진행 중",
  ASSIGNING: "선수 배정 중",
  PAUSED: "일시정지",
  TECHNICAL_PAUSED: "기술 정지",
  COMPLETED: "밴픽 완료",
  ABORTED: "밴픽 중단",
};

export function DraftExperience({ draftId }: { draftId: string }) {
  const numericDraftId = Number(draftId);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [query, setQuery] = useState("");
  const [selectedChampionId, setSelectedChampionId] = useState<number | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [clockNow, setClockNow] = useState(() => Date.now());
  const requestController = useRef<AbortController | null>(null);
  const socketRef = useRef<ReturnType<typeof connectDraftSocket> | null>(null);
  const lastSeqRef = useRef(0);
  const syncTimerRef = useRef<number | null>(null);
  const syncRequestRef = useRef(0);
  const championsRef = useRef<Champion[]>([]);
  const revealTimerRef = useRef<number | null>(null);
  const [reveal, setReveal] = useState<{ champion: Champion; actionType: "BAN" | "PICK"; side: Side; key: number } | null>(null);

  const showReveal = useCallback((champion: Champion, actionType: "BAN" | "PICK", side: Side) => {
    if (revealTimerRef.current !== null) window.clearTimeout(revealTimerRef.current);
    setReveal({ champion, actionType, side, key: Date.now() });
    revealTimerRef.current = window.setTimeout(() => setReveal(null), 3000);
  }, []);

  const load = useCallback(async () => {
    if (!Number.isInteger(numericDraftId) || numericDraftId <= 0) {
      setMessage("올바르지 않은 Draft 번호입니다.");
      setLoading(false);
      return;
    }

    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setLoading(true);
    setMessage(null);

    try {
      const [draftState, championList] = await Promise.all([
        fetchDraft(numericDraftId, { signal: controller.signal }),
        fetchChampions({ signal: controller.signal }),
      ]);
      if (controller.signal.aborted) return;
      setDraft(draftState);
      lastSeqRef.current = draftState.lastEventSeq;
      setChampions(championList);
      championsRef.current = championList;
    } catch (error) {
      if (controller.signal.aborted) return;
      setMessage(error instanceof Error ? error.message : "Draft를 불러오지 못했습니다.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [numericDraftId]);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => void load(), 0);
    return () => {
      window.clearTimeout(loadTimer);
      requestController.current?.abort();
    };
  }, [load]);

  const refreshDraft = useCallback(async () => {
    const requestId = ++syncRequestRef.current;
    try {
      const next = await fetchDraft(numericDraftId);
      if (requestId !== syncRequestRef.current) return;
      setDraft(next);
      lastSeqRef.current = next.lastEventSeq;
    } catch (error) {
      if (requestId !== syncRequestRef.current) return;
      setMessage(error instanceof Error ? error.message : "최신 Draft 상태를 복구하지 못했습니다.");
    } finally {
      if (requestId === syncRequestRef.current) setSaving(false);
    }
  }, [numericDraftId]);

  const draftLoaded = draft !== null;

  useEffect(() => {
    if (draft?.status !== "IN_PROGRESS") return;
    const timer = window.setInterval(() => setClockNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [draft?.status]);

  useEffect(() => {
    if (!draftLoaded) return;
    let stopped = false;
    let reconnectAttempt = 0;
    let reconnectTimer: number | null = null;

    const scheduleSync = () => {
      if (syncTimerRef.current !== null) window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = window.setTimeout(() => {
        syncTimerRef.current = null;
        void refreshDraft();
      }, 25);
    };

    const handleEvent = (event: DraftRealtimeEvent) => {
      if (event.type === "ERROR") {
        const payload = event.payload as { message?: string };
        setMessage(payload.message ?? "실시간 Draft 명령을 처리하지 못했습니다.");
        setSaving(false);
        return;
      }
      if (event.type === "SNAPSHOT") {
        if (event.seq < lastSeqRef.current) return;
        const snapshot = event.payload as DraftState;
        if (snapshot?.draftId === numericDraftId) {
          lastSeqRef.current = event.seq;
          setDraft(snapshot);
          setSaving(false);
        }
        return;
      }
      if (event.seq <= lastSeqRef.current) return;
      if (event.seq !== lastSeqRef.current + 1) {
        scheduleSync();
        return;
      }
      lastSeqRef.current = event.seq;
      if (event.type === "ACTION_LOCKED") {
        const payload = event.payload as { championId?: number; actionType?: "BAN" | "PICK"; side?: Side };
        const champion = championsRef.current.find((item) => item.id === payload.championId);
        if (champion && payload.actionType && payload.side) showReveal(champion, payload.actionType, payload.side);
        setSelectedChampionId(null);
        setSelectedPlayerId(null);
      }
      scheduleSync();
    };

    const connect = () => {
      try {
        const connection = connectDraftSocket(numericDraftId, lastSeqRef.current, {
          onOpen: () => {
            reconnectAttempt = 0;
            setSocketConnected(true);
          },
          onEvent: handleEvent,
          onClose: () => {
            if (stopped) return;
            setSocketConnected(false);
            setSaving(false);
            const delay = Math.min(1_000 * 2 ** reconnectAttempt, 10_000);
            reconnectAttempt += 1;
            reconnectTimer = window.setTimeout(connect, delay);
          },
        });
        socketRef.current = connection;
      } catch {
        if (stopped) return;
        const delay = Math.min(1_000 * 2 ** reconnectAttempt, 10_000);
        reconnectAttempt += 1;
        reconnectTimer = window.setTimeout(connect, delay);
      }
    };

    connect();
    return () => {
      stopped = true;
      setSocketConnected(false);
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      if (syncTimerRef.current !== null) window.clearTimeout(syncTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
      if (revealTimerRef.current !== null) window.clearTimeout(revealTimerRef.current);
    };
  }, [draftLoaded, numericDraftId, refreshDraft, showReveal]);

  const runMutation = useCallback(
    async (action: () => Promise<DraftState>) => {
      setSaving(true);
      setMessage(null);
      try {
        const next = await action();
        setDraft(next);
        lastSeqRef.current = next.lastEventSeq;
        setSelectedChampionId(null);
        setSelectedPlayerId(null);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "요청을 처리하지 못했습니다.");
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const sendOrFallback = useCallback(
    (command: DraftSocketCommand, fallback: () => Promise<DraftState>) => {
      setSaving(true);
      setMessage(null);
      if (socketRef.current?.send(command)) return;
      void runMutation(fallback);
    },
    [runMutation],
  );

  const currentStep = draft?.steps.find((step) => step.stepNo === draft.currentStep) ?? null;
  const nextStep = draft?.steps.find((step) => step.stepNo === draft.currentStep + 1) ?? null;
  const currentActor = draft && currentStep ? turnActor(draft, currentStep.stepNo) : null;
  const nextActor = draft && nextStep ? turnActor(draft, nextStep.stepNo) : null;
  const defaultPickPlayer =
    draft && currentStep?.actionType === "PICK"
      ? pickPlayerForStep(draft, currentStep.stepNo)
      : null;
  const usedChampionIds = useMemo(
    () => new Set(draft?.steps.flatMap((step) => (step.champion ? [step.champion.id] : [])) ?? []),
    [draft],
  );
  const fearlessChampionIds = useMemo(
    () => new Set(draft?.bannedByFearless ?? []),
    [draft],
  );

  const availableChampions = useMemo<DraftChampion[]>(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko");
    return champions
      .filter(
        (champion) =>
          role === "ALL" || getChampionLanes(champion.riotId).includes(role),
      )
      .filter((champion) =>
        `${champion.nameKo} ${champion.riotId}`
          .toLocaleLowerCase("ko")
          .includes(normalizedQuery),
      )
      .map((champion) => ({
        ...champion,
        mark: champion.riotId.slice(0, 2).toUpperCase(),
        disabledReason: usedChampionIds.has(champion.id)
          ? "이번 매치에서 이미 확정됨"
          : fearlessChampionIds.has(champion.id)
            ? "피어리스 사용 제한"
            : draft?.viewer.canLock
              ? undefined
              : "현재 조작 가능한 차례가 아닙니다.",
      }));
  }, [champions, draft?.viewer.canLock, fearlessChampionIds, query, role, usedChampionIds]);

  const selectedChampion = champions.find((champion) => champion.id === selectedChampionId);
  const viewerTeam = draft?.viewer.side ? draft.teams[draft.viewer.side] : null;

  const handleLock = () => {
    if (!draft || !currentStep || !selectedChampionId) return;
    const input = {
      stepNo: currentStep.stepNo,
      championId: selectedChampionId,
      playerId:
        currentStep.actionType === "PICK"
          ? (selectedPlayerId ?? defaultPickPlayer?.playerId ?? null)
          : null,
      expectedVersion: draft.version,
    };
    sendOrFallback(
      { type: "LOCK", ...input },
      () => lockDraft(draft.draftId, input),
    );
    if (selectedChampion) showReveal(selectedChampion, currentStep.actionType, currentStep.side);
  };

  const handleChampionSelect = (championId: number) => {
    setSelectedChampionId(championId);
    if (!draft || !currentStep || !draft.viewer.canLock) return;
    const input = {
      stepNo: currentStep.stepNo,
      championId,
      expectedVersion: draft.version,
    };
    if (
      !socketRef.current?.send({
        type: "HOVER",
        ...input,
      })
    ) {
      void hoverDraft(draft.draftId, input)
        .then((next) => {
          setDraft(next);
          lastSeqRef.current = next.lastEventSeq;
        })
        .catch((error: unknown) =>
          setMessage(error instanceof Error ? error.message : "hover를 공유하지 못했습니다."),
        );
    }
  };

  if (loading) {
    return <DraftScreenMessage title="Draft 상태를 불러오는 중입니다." />;
  }

  if (!draft) {
    return (
      <DraftScreenMessage title="Draft를 불러오지 못했습니다.">
        <p className="text-xs text-muted">{message}</p>
        <button type="button" onClick={() => void load()} className="border border-gold px-4 py-2 text-xs text-gold">
          다시 시도
        </button>
      </DraftScreenMessage>
    );
  }

  const lockedChampions = draft.lockedChampions.map<LockedChampion>((locked) => ({
    id: locked.champion.id,
    name: locked.champion.nameKo,
    mark: locked.champion.riotId.slice(0, 2).toUpperCase(),
    sourceMatchId: locked.sourceMatchId,
    source: locked.source,
    imageUrl: locked.champion.imageUrl,
  }));
  const bluePicks = buildPickSlots(draft, "BLUE");
  const redPicks = buildPickSlots(draft, "RED");
  const turnRemainingMs = currentStep
    ? liveTurnRemaining(draft.turnDeadlineAt, clockNow)
    : 0;
  const blueReserveMs = liveReserveRemaining(draft, "BLUE", currentStep?.side ?? null, clockNow);
  const redReserveMs = liveReserveRemaining(draft, "RED", currentStep?.side ?? null, clockNow);

  return (
    <main className="flex h-dvh min-h-[680px] flex-col overflow-hidden bg-bg text-text">
      <header className="grid h-[86px] shrink-0 grid-cols-[1fr_310px_1fr] border-b border-line bg-surface">
        <TeamHeader
          side="BLUE"
          teamName={draft.teams.BLUE.teamName}
          captainName={draft.teams.BLUE.captainDisplayName}
          ready={draft.status === "COMPLETED" ? draft.assignmentConfirmed.BLUE : isTeamReady(draft, "BLUE")}
          active={currentStep?.side === "BLUE"}
        />
        <section className="flex flex-col items-center justify-center gap-1 border-x border-line bg-raised">
          <small className="eyebrow">{draft.session.name ?? "내전 세션"}</small>
          <strong className="text-sm tracking-[0.12em]">{STATUS_LABEL[draft.status]}</strong>
          <span className="tabular text-[9px] text-muted">
            {draft.session.gameNo}번째 매치 · Draft #{draft.draftId}
          </span>
        </section>
        <TeamHeader
          side="RED"
          teamName={draft.teams.RED.teamName}
          captainName={draft.teams.RED.captainDisplayName}
          ready={draft.status === "COMPLETED" ? draft.assignmentConfirmed.RED : isTeamReady(draft, "RED")}
          active={currentStep?.side === "RED"}
        />
      </header>

      <section className="grid h-[76px] shrink-0 grid-cols-[1fr_390px_1fr] border-b border-line bg-surface">
        <Reserve side="BLUE" reserveMs={blueReserveMs} active={currentStep?.side === "BLUE"} />
        <div className="relative flex flex-col items-center justify-center bg-text text-bg">
          <span className="tabular text-[8px] tracking-[0.2em] text-dim">
            {draft.currentStep || 0} / {draft.steps.length}
          </span>
          <strong className="mt-0.5 flex max-w-[360px] items-center gap-1 truncate text-xs tracking-[0.08em]">
            {currentActor?.lane && <LaneIcon lane={currentActor.lane} size={18} />}
            <span className="truncate">
              {currentStep
                ? `${currentActor?.label ?? currentStep.side} · ${currentStep.actionType}`
                : STATUS_LABEL[draft.status]}
            </span>
          </strong>
          {currentStep && (
            <span className="tabular mt-0.5 text-[10px] font-semibold">
              {turnRemainingMs > 0
                ? `남은 시간 ${formatDuration(turnRemainingMs)}`
                : `예비 시간 ${formatDuration(currentStep.side === "BLUE" ? blueReserveMs : redReserveMs)}`}
            </span>
          )}
          {nextStep && (
            <span className="mt-0.5 flex max-w-[360px] items-center gap-1 truncate text-[8px] text-dim">
              다음 · {nextActor?.lane && <LaneIcon lane={nextActor.lane} size={14} />}
              {nextActor?.label ?? nextStep.side} · {nextStep.actionType}
            </span>
          )}
          {currentStep && (
            <span
              className={`absolute inset-x-16 bottom-0 h-0.5 ${
                currentStep.side === "BLUE" ? "bg-blue" : "bg-red"
              }`}
            />
          )}
        </div>
        <Reserve side="RED" reserveMs={redReserveMs} active={currentStep?.side === "RED"} />
      </section>

      {message && (
        <div className="shrink-0 border-b border-red/40 bg-red/10 px-6 py-2 text-center text-xs text-red">
          {message}
        </div>
      )}

      <section className="grid min-h-0 flex-1 grid-cols-[minmax(230px,290px)_minmax(440px,1fr)_minmax(230px,290px)] overflow-hidden">
        <DraftRail
          side="BLUE"
          teamName={draft.teams.BLUE.teamName}
          picks={bluePicks}
          lockedChampions={lockedChampions}
          activePickIndices={activePickIndices(draft, "BLUE", bluePicks)}
          activeTurn={currentStep?.side === "BLUE"}
        />

        <section className="relative flex min-h-0 min-w-0 flex-col bg-bg px-7 py-5">
          {reveal && <ChampionReveal key={reveal.key} champion={reveal.champion} actionType={reveal.actionType} side={reveal.side} />}
          {(draft.status === "WAITING" || draft.status === "READY") && (
            <ReadyPanel
              draft={draft}
              saving={saving}
              onReady={() =>
                sendOrFallback(
                  { type: "READY", expectedVersion: draft.version },
                  () => readyDraft(draft.draftId, draft.version),
                )
              }
            />
          )}

          {draft.status === "IN_PROGRESS" && (
            <>
              <div className="flex shrink-0 items-end justify-between border-b border-line">
                <strong className="border-b-2 border-gold pb-3 text-xs tracking-wide">CHAMPIONS</strong>
                <span className="tabular pb-3 text-[10px] text-dim">
                  {availableChampions.filter((champion) => !champion.disabledReason).length} AVAILABLE
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 py-3">
                {(["ALL", ...LANES] as RoleFilter[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={role === item}
                    onClick={() => setRole(item)}
                    className={`border px-3 py-1.5 text-[10px] ${
                      role === item
                        ? "border-line bg-raised text-text"
                        : "border-transparent text-muted hover:text-text"
                    }`}
                  >
                    {item}
                  </button>
                ))}
                <label className="ml-auto flex h-8 w-48 items-center gap-2 border border-line bg-surface px-3 text-muted">
                  <span aria-hidden="true">⌕</span>
                  <span className="sr-only">챔피언 검색</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search champion"
                    className="min-w-0 flex-1 bg-transparent text-[11px] text-text outline-none placeholder:text-dim"
                  />
                </label>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden">
                <ChampionGrid
                  champions={availableChampions}
                  selectedChampionId={selectedChampionId ?? draft.hover?.champion?.id ?? null}
                  onSelect={handleChampionSelect}
                />
              </div>

              <footer className="flex min-h-[72px] shrink-0 items-center justify-between gap-4 border-t border-line pt-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="border border-gold px-2 py-1.5 text-[8px] font-bold text-gold">
                    {currentStep?.actionType ?? "LOCK"}
                  </span>
                  <p className="min-w-0">
                    <small className="block text-[8px] text-dim">현재 선택</small>
                    <strong className="block truncate text-sm">
                      {selectedChampion?.nameKo ?? draft.hover?.champion?.nameKo ?? "선택 없음"}
                    </strong>
                    {draft.hover && !selectedChampion && (
                      <small className="block text-[8px] text-dim">
                        {draft.hover.side} 팀장 hover
                      </small>
                    )}
                  </p>
                  {currentStep?.actionType === "PICK" && draft.viewer.canLock && viewerTeam && (
                    <select
                      value={selectedPlayerId ?? defaultPickPlayer?.playerId ?? ""}
                      onChange={(event) =>
                        setSelectedPlayerId(event.target.value ? Number(event.target.value) : null)
                      }
                      className="h-9 border border-line bg-surface px-2 text-xs text-text"
                    >
                      <option value="" disabled>
                        기본 픽 순서의 선수
                      </option>
                      {viewerTeam.players.map((player) => (
                        <option key={player.playerId} value={player.playerId}>
                          {LANE_LABEL[player.lane]} · {player.displayName}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  type="button"
                  disabled={!selectedChampion || !draft.viewer.canLock || saving}
                  onClick={handleLock}
                  className="h-10 shrink-0 bg-gold px-6 text-xs font-bold text-bg disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? "확정 중" : "선택 확정"} <span className="ml-3">↵</span>
                </button>
              </footer>
            </>
          )}

          {draft.status === "ASSIGNING" && (
            <AssignmentPanel
              draft={draft}
              saving={saving}
              onAssign={(playerId, championId) =>
                sendOrFallback(
                  {
                    type: "ASSIGN_CHAMPION",
                    playerId,
                    championId,
                    expectedVersion: draft.version,
                  },
                  () =>
                    assignDraftChampion(draft.draftId, {
                      playerId,
                      championId,
                      expectedVersion: draft.version,
                    }),
                )
              }
              onConfirm={() =>
                sendOrFallback(
                  { type: "CONFIRM_ASSIGNMENT", expectedVersion: draft.version },
                  () => confirmDraftAssignment(draft.draftId, draft.version),
                )
              }
            />
          )}

          {draft.status === "COMPLETED" && (
            <DraftScreenMessage title="양 팀 선수 배정이 확정되었습니다.">
              <p className="text-xs text-muted">세션 화면으로 돌아가 경기를 시작할 수 있습니다.</p>
            </DraftScreenMessage>
          )}

          {(draft.status === "PAUSED" ||
            draft.status === "TECHNICAL_PAUSED" ||
            draft.status === "ABORTED") && (
            <DraftScreenMessage title={STATUS_LABEL[draft.status]} />
          )}
        </section>

        <DraftRail
          side="RED"
          teamName={draft.teams.RED.teamName}
          picks={redPicks}
          lockedChampions={lockedChampions}
          activePickIndices={activePickIndices(draft, "RED", redPicks)}
          activeTurn={currentStep?.side === "RED"}
        />
      </section>

      <footer className="tabular flex h-[34px] shrink-0 items-center justify-between border-t border-line bg-surface px-6 text-[8px] tracking-[0.12em] text-dim">
        <span className="flex items-center gap-2">
          <i className={`size-1.5 rounded-full ${draft.status === "IN_PROGRESS" ? "bg-red" : "bg-gold"}`} />
          {STATUS_LABEL[draft.status]}
        </span>
        <span>
          {socketConnected ? "REALTIME CONNECTED" : "REALTIME RECONNECTING"} · VIEWER {draft.viewer.role} · VERSION {draft.version}
        </span>
        <span>{draft.session.fearlessMode}</span>
      </footer>
    </main>
  );
}

function ReadyPanel({
  draft,
  saving,
  onReady,
}: {
  draft: DraftState;
  saving: boolean;
  onReady: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
      <span className="eyebrow">MATCH {draft.session.gameNo}</span>
      <h1 className="text-2xl font-semibold">양 팀장의 READY를 기다립니다.</h1>
      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {(["BLUE", "RED"] as Side[]).map((side) => (
          <div key={side} className="border border-line bg-surface px-4 py-4">
            <strong className={side === "BLUE" ? "text-blue" : "text-red"}>
              {draft.teams[side].teamName}
            </strong>
            <p className="mt-2 text-xs text-muted">팀장 {draft.teams[side].captainDisplayName}</p>
            <p className="mt-1 text-[10px] text-dim">
              {isTeamReady(draft, side) ? "READY 완료" : "READY 대기"}
            </p>
          </div>
        ))}
      </div>
      {draft.viewer.canReady ? (
        <button
          type="button"
          disabled={saving}
          onClick={onReady}
          className="bg-gold px-8 py-3 text-xs font-bold text-bg disabled:opacity-40"
        >
          {saving ? "처리 중" : "READY 확인"}
        </button>
      ) : (
        <p className="text-xs text-muted">팀장 READY가 모두 완료되면 밴픽이 시작됩니다.</p>
      )}
    </div>
  );
}

function AssignmentPanel({
  draft,
  saving,
  onAssign,
  onConfirm,
}: {
  draft: DraftState;
  saving: boolean;
  onAssign: (playerId: number, championId: number) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-line pb-3">
        <span className="eyebrow">FINAL ASSIGNMENT</span>
        <div className="mt-1 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold">선수별 챔피언을 최종 배정하세요.</h2>
          <span className="tabular text-[10px] text-muted">
            마감 {formatDeadline(draft.assignmentDeadlineAt)}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-dim">
          이미 배정된 챔피언을 다른 선수에게 선택하면 두 선수의 챔피언이 교환됩니다.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {(["BLUE", "RED"] as Side[]).map((side) => {
          const team = draft.teams[side];
          const picks = draft.steps
            .filter((step) => step.side === side && step.actionType === "PICK" && step.champion)
            .map((step) => step.champion as DraftChampionSummary);
          const editable = draft.viewer.side === side && draft.viewer.canAssign;
          return (
            <section key={side} className="mb-5 last:mb-0">
              <div className="mb-2 flex items-center justify-between">
                <strong className={side === "BLUE" ? "text-blue" : "text-red"}>
                  {team.teamName} · 팀장 {team.captainDisplayName}
                </strong>
                <span className="text-[10px] text-dim">
                  {draft.assignmentConfirmed[side] ? "배정 확정" : "배정 중"}
                </span>
              </div>
              <ul className="space-y-1.5">
                {team.players.map((player) => {
                  const assignment = draft.assignments.find(
                    (candidate) => candidate.playerId === player.playerId,
                  );
                  return (
                    <li
                      key={player.playerId}
                      className="grid grid-cols-[88px_1fr] items-center gap-3 border border-line-soft bg-surface px-3 py-2"
                    >
                      <span className="flex items-center gap-1 text-[10px] text-muted">
                        <LaneTag lane={player.lane} /> · {player.displayName}
                      </span>
                      {editable ? (
                        <select
                          value={assignment?.champion.id ?? ""}
                          disabled={saving}
                          onChange={(event) => {
                            if (event.target.value) onAssign(player.playerId, Number(event.target.value));
                          }}
                          className="h-8 min-w-0 border border-line bg-bg px-2 text-xs text-text"
                        >
                          <option value="">챔피언 선택</option>
                          {picks.map((champion) => (
                            <option key={champion.id} value={champion.id}>
                              {champion.nameKo}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <strong className="text-xs">
                          {assignment?.champion.nameKo ?? "미배정"}
                          {assignment?.auto ? " · 자동" : ""}
                        </strong>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {draft.viewer.side && !draft.assignmentConfirmed[draft.viewer.side] && (
        <button
          type="button"
          disabled={!draft.viewer.canConfirmAssignment || saving}
          onClick={onConfirm}
          className="mt-3 h-11 shrink-0 bg-gold text-xs font-bold text-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "확정 중" : "내 팀 선수 배정 확정"}
        </button>
      )}
    </div>
  );
}

function buildPickSlots(draft: DraftState, side: Side): PickSlot[] {
  return draft.teams[side].players.map((player) => {
    const assignment = draft.assignments.find(
      (candidate) => candidate.playerId === player.playerId,
    );
    const temporaryStep = draft.steps.find(
      (step) => step.playerId === player.playerId && step.actionType === "PICK",
    );
    const champion = assignment?.champion ?? temporaryStep?.champion ?? null;
    return {
      lane: player.lane,
      player: player.displayName,
      champion: champion?.nameKo ?? null,
      mark: champion?.riotId.slice(0, 2).toUpperCase() ?? "—",
      imageUrl: champion?.imageUrl ?? null,
    };
  });
}

function ChampionReveal({ champion, actionType, side }: { champion: Champion; actionType: "BAN" | "PICK"; side: Side }) {
  const splashUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.riotId}_0.jpg`;
  const isBan = actionType === "BAN";
  return (
    <div className="draft-champion-reveal pointer-events-none absolute inset-0 z-30 grid place-items-center overflow-hidden bg-black/80">
      <Image
        src={splashUrl}
        alt=""
        fill
        sizes="100vw"
        className={`scale-110 object-cover opacity-25 blur-xl ${isBan ? "grayscale" : ""}`}
        priority
      />
      <div className={`relative aspect-[1215/717] w-[92%] max-w-5xl overflow-hidden border bg-black shadow-2xl ${side === "BLUE" ? "border-blue" : "border-red"}`}>
        <Image
          src={splashUrl}
          alt={champion.nameKo}
          fill
          sizes="(max-width: 1024px) 92vw, 1024px"
          className={`object-contain ${isBan ? "grayscale" : ""}`}
          priority
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${isBan ? "from-black via-black/10 to-black/30" : "from-black via-transparent to-black/20"}`} />
        <div className="absolute inset-x-0 bottom-0 px-6 py-5 text-center">
          <p className={`text-[10px] font-semibold tracking-[.3em] ${side === "BLUE" ? "text-blue" : "text-red"}`}>{side} · {actionType}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{champion.nameKo}</p>
        </div>
      </div>
    </div>
  );
}

function activePickIndices(draft: DraftState, side: Side, picks: PickSlot[]) {
  return activeTurnSteps(draft)
    .filter((step) => step.side === side && step.actionType === "PICK")
    .map(
      (step) =>
        draft.steps.filter(
          (candidate) =>
            candidate.side === side &&
            candidate.actionType === "PICK" &&
            candidate.stepNo < step.stepNo,
        ).length,
    )
    .filter((index) => index < picks.length);
}

function activeTurnSteps(draft: DraftState) {
  const currentIndex = draft.steps.findIndex(
    (step) => step.stepNo === draft.currentStep,
  );
  if (currentIndex < 0) return [];

  const current = draft.steps[currentIndex];
  const sameTurn = (index: number) => {
    const step = draft.steps[index];
    return (
      step?.side === current.side &&
      step.actionType === current.actionType &&
      step.phase === current.phase
    );
  };

  let start = currentIndex;
  while (start > 0 && sameTurn(start - 1)) start -= 1;
  let end = currentIndex;
  while (end + 1 < draft.steps.length && sameTurn(end + 1)) end += 1;
  return draft.steps.slice(start, end + 1);
}

function pickPlayerForStep(draft: DraftState, stepNo: number) {
  const step = draft.steps.find((candidate) => candidate.stepNo === stepNo);
  if (!step || step.actionType !== "PICK") return null;
  const index = draft.steps.filter(
    (candidate) =>
      candidate.side === step.side &&
      candidate.actionType === "PICK" &&
      candidate.stepNo < step.stepNo,
  ).length;
  return draft.teams[step.side].players[index] ?? null;
}

function turnActor(draft: DraftState, stepNo: number) {
  const step = draft.steps.find((candidate) => candidate.stepNo === stepNo);
  if (!step) return null;
  if (step.actionType === "BAN") {
    return {
      label: `${draft.teams[step.side].captainDisplayName} 팀장`,
      side: step.side,
      lane: null,
    };
  }
  const player = pickPlayerForStep(draft, stepNo);
  return {
    label: player ? player.displayName : draft.teams[step.side].teamName,
    side: step.side,
    lane: player?.lane ?? null,
  };
}

function isTeamReady(draft: DraftState, side: Side) {
  return draft.teams[side].ready;
}

function TeamHeader({
  side,
  teamName,
  captainName,
  ready,
  active,
}: {
  side: Side;
  teamName: string;
  captainName: string;
  ready: boolean;
  active: boolean;
}) {
  const isBlue = side === "BLUE";
  return (
    <section
      className={`flex items-center justify-between border-t-[3px] px-8 transition-colors ${
        isBlue ? "border-blue" : "border-red"
      } ${
        active ? (isBlue ? "bg-blue-dim/25" : "bg-red-dim/25") : ""
      }`}
    >
      {!isBlue && <span className="text-[10px] text-muted">{ready ? "READY" : "WAITING"}</span>}
      <div className={`flex items-center gap-3 ${isBlue ? "" : "flex-row-reverse text-right"}`}>
        <span
          className={`tabular grid h-10 min-w-14 place-items-center border px-2 text-[10px] font-semibold ${
            isBlue ? "border-blue text-blue" : "border-red text-red"
          }`}
        >
          {side}
        </span>
        <div>
          <strong className="block text-base">{teamName}</strong>
          <small className={`text-[9px] tracking-[0.2em] ${isBlue ? "text-blue" : "text-red"}`}>
            {active ? "NOW PLAYING" : `${side} SIDE`} · 팀장 {captainName}
          </small>
        </div>
      </div>
      {isBlue && <span className="text-[10px] text-muted">{ready ? "READY" : "WAITING"}</span>}
    </section>
  );
}

function Reserve({ side, reserveMs, active }: { side: Side; reserveMs: number; active: boolean }) {
  return (
    <div className={`flex items-center justify-between px-10 ${active ? (side === "BLUE" ? "bg-blue-dim/15" : "bg-red-dim/15") : ""}`}>
      <span className={`text-[10px] tracking-[0.15em] ${side === "BLUE" ? "text-blue" : "text-red"}`}>
        {side} RESERVE
      </span>
      <strong className="tabular text-xl">{formatDuration(reserveMs)}</strong>
    </div>
  );
}

function liveTurnRemaining(deadline: string | null, clockNow: number) {
  if (!deadline) return 0;
  return Math.max(0, new Date(deadline).getTime() - clockNow);
}

function liveReserveRemaining(
  draft: DraftState,
  side: Side,
  activeSide: Side | null,
  clockNow: number,
) {
  const reserveAtSnapshot = side === "BLUE" ? draft.blueReserveMs : draft.redReserveMs;
  if (side !== activeSide || !draft.turnDeadlineAt) return reserveAtSnapshot;
  const deadline = new Date(draft.turnDeadlineAt).getTime();
  const snapshot = new Date(draft.serverTime).getTime();
  const elapsedSinceSnapshot = Math.max(0, clockNow - Math.max(deadline, snapshot));
  return Math.max(0, reserveAtSnapshot - elapsedSinceSnapshot);
}

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function formatDeadline(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function DraftScreenMessage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 bg-bg text-center text-text">
      <strong className="text-lg">{title}</strong>
      {children}
    </div>
  );
}
