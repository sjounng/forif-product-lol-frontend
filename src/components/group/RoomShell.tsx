"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { fetchRoom } from "@/lib/api/rooms";
import type { Room } from "@/types";

interface RoomContextValue {
  room: Room;
  setRoom(room: Room): void;
  reload(): Promise<void>;
}

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomShell({
  roomId,
  children,
}: {
  roomId: number;
  children: ReactNode;
}) {
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const reload = useCallback(async () => {
    try {
      const loadedRoom = await fetchRoom(roomId);
      setError(null);
      setRoom(loadedRoom);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "그룹을 불러오지 못했습니다.");
    }
  }, [roomId]);

  useEffect(() => {
    let active = true;
    fetchRoom(roomId)
      .then((loadedRoom) => {
        if (!active) return;
        setRoom(loadedRoom);
      })
      .catch((caught) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : "그룹을 불러오지 못했습니다.");
        }
      });
    return () => {
      active = false;
    };
  }, [roomId]);

  const value = useMemo(
    () => (room ? { room, setRoom, reload } : null),
    [reload, room],
  );

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="text-center">
          <p className="text-sm text-loss">{error}</p>
          <Link href="/rooms" className="mt-4 inline-block text-sm text-gold hover:underline">
            그룹 목록으로
          </Link>
        </div>
      </main>
    );
  }

  if (!room || !value) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-sm text-muted">
        그룹을 불러오는 중…
      </div>
    );
  }

  return (
    <RoomContext.Provider value={value}>
      <Sidebar roomId={room.id} roomName={room.name} open={sidebarOpen} onToggle={() => setSidebarOpen((value) => !value)} />
      <div className="min-w-0 flex-1">{children}</div>
    </RoomContext.Provider>
  );
}

export function useRoom(): RoomContextValue {
  const context = useContext(RoomContext);
  if (!context) throw new Error("useRoom must be used inside RoomShell");
  return context;
}
