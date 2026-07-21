import type { Room } from "@/types";

/**
 * 담당: A
 *
 * 백엔드 미구현. A가 백엔드 방 API를 만들면서 같이 붙인다.
 *   GET    /api/rooms                     내가 만든 방 목록
 *   POST   /api/rooms                     { name, description, entryCode } → publicCode 발급
 *   GET    /api/rooms/{roomId}
 *   PATCH  /api/rooms/{roomId}            { name, description, guestCanDraft }
 *   POST   /api/rooms/{roomId}/entry-code 입장 코드 재발급
 *
 * 주의: public_code(URL 슬러그, 노출 OK)와 entry_code(입장 암호, 해시 저장)는 별개다.
 * 입장 코드 평문은 서버가 재발급 응답에서 딱 한 번만 돌려준다 — 화면에서 복사시킬 것.
 */

// TODO(A): apiFetch 로 구현
export async function fetchRooms(): Promise<Room[]> {
  throw new Error("미구현: GET /api/rooms");
}

// TODO(A): apiFetch 로 구현
export async function fetchRoom(_roomId: number): Promise<Room> {
  throw new Error("미구현: GET /api/rooms/{roomId}");
}

// TODO(A): apiFetch 로 구현
export async function createRoom(_input: {
  name: string;
  description: string;
  entryCode: string;
}): Promise<Room> {
  throw new Error("미구현: POST /api/rooms");
}

/** 게스트가 입장 코드를 검증받는다. 성공하면 서버가 쿠키(guest token)를 심는다. */
// TODO(A): apiFetch 로 구현
export async function enterRoom(
  _publicCode: string,
  _entryCode: string,
  _nickname: string,
): Promise<{ roomName: string }> {
  throw new Error("미구현: POST /api/r/{publicCode}/enter");
}
