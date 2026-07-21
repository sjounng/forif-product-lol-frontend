import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { mockRooms } from "@/lib/mock";

/**
 * TODO(A): mockRooms 조회 → fetchRoom(roomId).
 *          없는 방이거나 내 방이 아니면 notFound().
 */
export default async function RoomLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const room = mockRooms.find((r) => r.id === Number(roomId)) ?? mockRooms[0];

  return (
    <>
      <Sidebar roomId={room.id} roomName={room.name} />
      <div className="min-w-0 flex-1">{children}</div>
    </>
  );
}
