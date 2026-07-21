import type { Champion, DraftStep } from "@/types";

/**
 * 담당: A (MVP 이후 — 로드맵 5단계, 구현 비용 최대)
 *
 * 백엔드 미구현. REST 는 초기 상태 로드용이고 진행은 전부 WebSocket 이다.
 *   GET  /api/drafts/{draftId}        초기 상태 (재접속 복원)
 *   WS   /ws/drafts/{draftId}         HOVER / LOCK / READY / TIMEOUT ...
 *
 * 반드시 지켜야 하는 것:
 *   - 타이머는 서버 소유다. 서버가 준 turn_deadline_at 을 기준으로 남은 시간을 "표시만" 한다.
 *     클라가 카운트다운을 소유하면 시계가 어긋나 확정 시점이 팀마다 달라진다.
 *   - 좌석(draft_seats)에 앉은 사람만 확정할 수 있다. 나머지는 전원 관전자.
 *   - 재접속하면 draft_events 의 seq 이후만 받아서 화면을 복원한다.
 *   - 서버가 UNIQUE(draft_id, champion_id)로 중복 픽을 거부한다. 낙관적으로 그리되 거부되면 롤백할 것.
 */

// TODO(A): apiFetch 로 구현
export async function fetchDraft(_draftId: number): Promise<{
  steps: DraftStep[];
  currentStep: number;
  turnDeadlineAt: string | null;
  /** 피어리스로 이미 소진된 챔피언 — 그리드에서 회색 처리 */
  bannedByFearless: number[];
}> {
  throw new Error("미구현: GET /api/drafts/{draftId}");
}

// TODO(A): WebSocket 연결. 재연결 백오프 + seq 기반 복원까지 포함할 것
export function connectDraftSocket(
  _draftId: number,
  _handlers: { onEvent: (event: unknown) => void; onClose: () => void },
): { send: (payload: unknown) => void; close: () => void } {
  throw new Error("미구현: WS /ws/drafts/{draftId}");
}

/**
 * 챔피언 목록은 Riot API가 아니라 Data Dragon(공개, 키 불필요)에서 온다.
 * 백엔드 champions 테이블을 채운 뒤 거기서 받아오는 게 맞다 — 패치마다 바뀌므로.
 */
// TODO(공통): apiFetch 로 구현
export async function fetchChampions(): Promise<Champion[]> {
  throw new Error("미구현: GET /api/champions");
}
