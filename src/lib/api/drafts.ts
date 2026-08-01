import type { Champion, DraftRealtimeEvent, DraftState } from "@/types";
import { API_BASE_URL, apiFetch, getAccessToken } from "./client";

/**
 * REST는 최초 상태 조회와 WebSocket 연결 실패 시 명령 fallback에 사용한다.
 * WebSocket은 마지막으로 처리한 seq 이후의 이벤트를 재생하며, 이벤트가 유실된 경우
 * 서버 SNAPSHOT으로 상태를 복원한다. 변경 명령은 REST와 동일한 DraftService 규칙을 사용한다.
 */

export function fetchDraft(
  draftId: number,
  init: Pick<RequestInit, "signal"> = {},
): Promise<DraftState> {
  return apiFetch<DraftState>(`/api/drafts/${draftId}`, init);
}

export function readyDraft(
  draftId: number,
  expectedVersion: number,
): Promise<DraftState> {
  return apiFetch<DraftState>(`/api/drafts/${draftId}/ready`, {
    method: "POST",
    body: JSON.stringify({ expectedVersion }),
  });
}

export function lockDraft(
  draftId: number,
  input: {
    stepNo: number;
    championId: number;
    playerId: number | null;
    expectedVersion: number;
  },
): Promise<DraftState> {
  return apiFetch<DraftState>(`/api/drafts/${draftId}/locks`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function assignDraftChampion(
  draftId: number,
  input: {
    playerId: number;
    championId: number;
    expectedVersion: number;
  },
): Promise<DraftState> {
  return apiFetch<DraftState>(`/api/drafts/${draftId}/assignments`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function confirmDraftAssignment(
  draftId: number,
  expectedVersion: number,
): Promise<DraftState> {
  return apiFetch<DraftState>(
    `/api/drafts/${draftId}/assignments/confirm`,
    {
      method: "POST",
      body: JSON.stringify({ expectedVersion }),
    },
  );
}

export function hoverDraft(
  draftId: number,
  input: {
    stepNo: number;
    championId: number | null;
    expectedVersion: number;
  },
): Promise<DraftState> {
  return apiFetch<DraftState>(`/api/drafts/${draftId}/hover`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type DraftSocketCommand =
  | { type: "READY"; expectedVersion: number }
  | {
      type: "HOVER";
      stepNo: number;
      championId: number | null;
      expectedVersion: number;
    }
  | {
      type: "LOCK";
      stepNo: number;
      championId: number;
      playerId: number | null;
      expectedVersion: number;
    }
  | {
      type: "ASSIGN_CHAMPION" | "SWAP_CHAMPIONS";
      playerId: number;
      championId: number;
      expectedVersion: number;
    }
  | { type: "CONFIRM_ASSIGNMENT"; expectedVersion: number };

export function connectDraftSocket(
  draftId: number,
  lastSeq: number,
  handlers: {
    onOpen?: () => void;
    onEvent: (event: DraftRealtimeEvent) => void;
    onClose: () => void;
  },
): { send: (command: DraftSocketCommand) => boolean; close: () => void } {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("실시간 Draft 연결에 필요한 인증 정보가 없습니다.");
  }
  const baseUrl =
    process.env.NEXT_PUBLIC_WS_BASE_URL ??
    API_BASE_URL.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  const url = new URL(`/ws/drafts/${draftId}`, baseUrl);
  url.searchParams.set("accessToken", accessToken);
  url.searchParams.set("lastSeq", String(lastSeq));
  const socket = new WebSocket(url);

  socket.addEventListener("open", () => handlers.onOpen?.());
  socket.addEventListener("message", (message) => {
    try {
      handlers.onEvent(JSON.parse(String(message.data)) as DraftRealtimeEvent);
    } catch {
      // 손상된 단일 메시지는 무시하고 다음 seq gap에서 Snapshot을 복구한다.
    }
  });
  socket.addEventListener("close", handlers.onClose);

  return {
    send(command) {
      if (socket.readyState !== WebSocket.OPEN) return false;
      socket.send(JSON.stringify(command));
      return true;
    },
    close() {
      socket.close(1000, "Draft page closed");
    },
  };
}

/**
 * 챔피언 목록은 Riot API가 아니라 Data Dragon(공개, 키 불필요)에서 온다.
 * 백엔드 champions 테이블을 채운 뒤 거기서 받아오는 게 맞다 — 패치마다 바뀌므로.
 */
export async function fetchChampions(
  init: Pick<RequestInit, "signal"> = {},
): Promise<Champion[]> {
  return apiFetch<Champion[]>("/api/champions", init);
}
