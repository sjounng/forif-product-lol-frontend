import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { mockRooms } from "@/lib/mock";

/**
 * 담당: A
 *
 * TODO(A):
 *   - mockRooms → fetchRooms()
 *   - "방 만들기" 모달: name, description, entryCode 입력 → createRoom()
 *     생성 응답의 publicCode 와 entryCode 를 한 번에 보여주고 복사 버튼을 준다.
 *     entryCode 평문은 이때가 마지막이다(서버는 해시만 저장).
 *   - 방이 0개일 때 EmptyState 를 쓴다
 */
export default function RoomsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-2">내 방</p>
          <h1 className="text-xl font-semibold tracking-tight">
            어떤 방을 여시겠어요?
          </h1>
        </div>
        <Button variant="primary">방 만들기</Button>
      </div>

      <ul className="space-y-2">
        {mockRooms.map((room) => (
          <li key={room.id}>
            <Link
              href={`/rooms/${room.id}`}
              className="flex items-center gap-5 rounded-[10px] border border-line bg-surface px-5 py-4 transition-colors hover:border-dim"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">{room.name}</p>
                <p className="mt-1 truncate text-[13px] text-dim">
                  {room.description ?? "설명 없음"}
                </p>
              </div>

              <div className="hidden items-center gap-6 sm:flex">
                <div className="text-right">
                  <p className="tabular text-sm">{room.playerCount}</p>
                  <p className="eyebrow mt-0.5">명단</p>
                </div>
                <div className="text-right">
                  <p className="tabular text-sm">{room.sessionCount}</p>
                  <p className="eyebrow mt-0.5">세션</p>
                </div>
              </div>

              <Badge>{room.publicCode}</Badge>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
