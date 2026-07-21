import type { BalanceCandidate, ScrimSession, SessionPlayer } from "@/types";

/**
 * 담당: B
 *
 * 백엔드 미구현.
 *   GET    /api/rooms/{roomId}/sessions
 *   POST   /api/rooms/{roomId}/sessions          { name, fearlessMode, ratingEnabled }
 *   GET    /api/sessions/{sessionId}/players
 *   POST   /api/sessions/{sessionId}/players     { playerIds[] }  참가 명단 확정
 *   PATCH  /api/sessions/{sessionId}/players/{playerId}  { status }  BENCHED/WITHDRAWN 전환
 *   POST   /api/sessions/{sessionId}/balance     { targetGameNo }  → 후보 N개
 *   POST   /api/sessions/{sessionId}/matches     { candidateId }   선택 → 매치 생성
 *
 * 세션은 10명 초과를 허용한다(후보 선수). 10명으로 잠그면 교체할 때 세션을 새로 파야 하고,
 * 그러면 피어리스 풀이 날아간다. 다음 판 투입 순번은 games_played ASC 로 정한다.
 *
 * 앱에서 막아야 할 것 (DB는 세션 인원을 세지 않는다):
 *   - 유효 인원 < 10 이면 팀 구성 버튼 비활성 ("2명 더 필요합니다")
 *   - WITHDRAWN 은 후보 풀에서 제외
 */

// TODO(B): apiFetch 로 구현
export async function fetchSessions(_roomId: number): Promise<ScrimSession[]> {
  throw new Error("미구현: GET /api/rooms/{roomId}/sessions");
}

// TODO(B): apiFetch 로 구현
export async function fetchSessionPlayers(
  _sessionId: number,
): Promise<SessionPlayer[]> {
  throw new Error("미구현: GET /api/sessions/{sessionId}/players");
}

/**
 * 팀 자동 구성. 브루트포스 완탐이라 1초 내에 끝난다 (DESIGN §5).
 * 제약을 못 맞추면 서버가 자동 완화하고 relaxed=true + relaxNote 를 준다.
 * 화면에 "라인 차이 제한 300→350 완화" 를 반드시 표시할 것.
 */
// TODO(B): apiFetch 로 구현
export async function runBalance(
  _sessionId: number,
  _targetGameNo: number,
): Promise<{
  candidates: BalanceCandidate[];
  relaxed: boolean;
  relaxNote: string | null;
}> {
  throw new Error("미구현: POST /api/sessions/{sessionId}/balance");
}
