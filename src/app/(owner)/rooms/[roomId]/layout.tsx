import type { ReactNode } from "react";
import { RoomShell } from "@/components/group/RoomShell";
import { AuthGuard } from "@/components/auth/AuthGuard";
export default async function RoomLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <AuthGuard><RoomShell roomId={Number(roomId)}>{children}</RoomShell></AuthGuard>;
}
