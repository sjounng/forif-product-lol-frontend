import type {
  CaptainInvitation,
  GroupGuest,
  GroupRole,
  GroupUser,
  GuestEntry,
  PublicRoom,
  Room,
  RoomMember,
} from "@/types";
import { apiFetch } from "@/lib/api/client";

export interface CreateRoomInput {
  name: string;
  description: string;
  opponentCaptainUserId?: number;
  guestAdmissionEnabled: boolean;
  entryPassword: string;
}
export interface UpdateRoomInput {
  name?: string;
  description?: string;
  guestAdmissionEnabled?: boolean;
  entryPassword?: string;
}

export function fetchRooms(): Promise<Room[]> {
  return apiFetch<Room[]>("/api/rooms");
}

export function fetchRoom(roomId: number): Promise<Room> {
  return apiFetch<Room>(`/api/rooms/${roomId}`);
}

export function createRoom(input: CreateRoomInput): Promise<Room> {
  return apiFetch<Room>("/api/rooms", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateRoom(roomId: number, input: UpdateRoomInput): Promise<Room> {
  return apiFetch<Room>(`/api/rooms/${roomId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function rotatePublicCode(roomId: number): Promise<Room> {
  return apiFetch<Room>(`/api/rooms/${roomId}/public-code`, {
    method: "POST",
  });
}

export function searchUsers(query: string): Promise<GroupUser[]> {
  return apiFetch<GroupUser[]>(
    `/api/users/search?q=${encodeURIComponent(query)}`,
  );
}

export function fetchCaptainInvitations(): Promise<CaptainInvitation[]> {
  return apiFetch<CaptainInvitation[]>("/api/group-invitations");
}

export function respondToCaptainInvitation(
  invitationId: number,
  response: "accept" | "reject",
): Promise<CaptainInvitation> {
  return apiFetch<CaptainInvitation>(
    `/api/group-invitations/${invitationId}/${response}`,
    { method: "POST" },
  );
}

export function inviteCaptain(
  roomId: number,
  userId: number,
): Promise<CaptainInvitation> {
  return apiFetch<CaptainInvitation>(
    `/api/rooms/${roomId}/captain-invitations`,
    {
      method: "POST",
      body: JSON.stringify({ userId }),
    },
  );
}

export function fetchRoomMembers(roomId: number): Promise<RoomMember[]> {
  return apiFetch<RoomMember[]>(`/api/rooms/${roomId}/members`);
}

export function changeRoomMemberRole(
  roomId: number,
  userId: number,
  role: Exclude<GroupRole, "GROUP_OWNER">,
): Promise<RoomMember> {
  return apiFetch<RoomMember>(`/api/rooms/${roomId}/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function fetchGuests(roomId: number): Promise<GroupGuest[]> {
  return apiFetch<GroupGuest[]>(`/api/rooms/${roomId}/guests`);
}

export function renameGuest(
  roomId: number,
  guestId: number,
  nickname: string,
): Promise<GroupGuest> {
  return apiFetch<GroupGuest>(`/api/rooms/${roomId}/guests/${guestId}`, {
    method: "PATCH",
    body: JSON.stringify({ nickname }),
  });
}

export function removeGuest(
  roomId: number,
  guestId: number,
): Promise<void> {
  return apiFetch<void>(`/api/rooms/${roomId}/guests/${guestId}`, {
    method: "DELETE",
  });
}

export function removeRoomMember(roomId: number, userId: number): Promise<void> {
  return apiFetch<void>(`/api/rooms/${roomId}/members/${userId}`, { method: "DELETE" });
}

export function leaveRoom(roomId: number): Promise<void> {
  return apiFetch<void>(`/api/rooms/${roomId}/members/me`, { method: "DELETE" });
}

export function deleteRoom(roomId: number): Promise<void> {
  return apiFetch<void>(`/api/rooms/${roomId}`, { method: "DELETE" });
}

export function fetchPublicRoom(publicCode: string): Promise<PublicRoom> {
  return apiFetch<PublicRoom>(`/api/public/rooms/${publicCode}`);
}

export function enterRoom(
  publicCode: string,
  entryPassword: string,
  nickname: string,
): Promise<GuestEntry> {
  return apiFetch<GuestEntry>(`/api/public/rooms/${publicCode}/guests`, {
    method: "POST",
    body: JSON.stringify({ entryPassword, nickname }),
  });
}

export function fetchCurrentGuest(publicCode: string): Promise<GuestEntry> {
  return apiFetch<GuestEntry>(
    `/api/public/rooms/${publicCode}/guests/me`,
  );
}

export function leaveGuestRoom(publicCode: string): Promise<void> {
  return apiFetch<void>(`/api/public/rooms/${publicCode}/guests/me`, { method: "DELETE" });
}

export function joinRoomByCode(publicCode: string, entryPassword: string): Promise<Room> {
  return apiFetch<Room>(`/api/rooms/join/${publicCode}`, {
    method: "POST",
    body: JSON.stringify({ entryPassword }),
  });
}
