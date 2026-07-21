import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { mockRooms } from "@/lib/mock";

/**
 * 담당: A
 *
 * TODO(A):
 *   1. 방 정보 수정 → PATCH /api/rooms/{roomId}
 *   2. 입장 링크 복사 버튼 — 실제로 사람들에게 뿌리는 건 이 URL이다. 크게, 누르기 쉽게.
 *   3. 입장 코드 재발급 → 새 평문 코드를 응답에서 딱 한 번 받는다.
 *      받은 즉시 모달로 보여주고 복사시킬 것. 다시 볼 수 없다(서버는 해시만 저장).
 *   4. guest_can_draft 토글 — 끄면 게스트는 좌석에 못 앉고 방장이 양쪽을 조작한다.
 */
export default async function RoomSettingsPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const room = mockRooms.find((r) => r.id === Number(roomId)) ?? mockRooms[0];
  const entryUrl = `https://scrim.local/r/${room.publicCode}`;

  return (
    <main className="max-w-2xl px-8 py-8">
      <div className="mb-8">
        <p className="eyebrow mb-2">설정</p>
        <h1 className="text-xl font-semibold tracking-tight">방 설정</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader eyebrow="참가자에게 공유" title="입장 링크" />
          <div className="space-y-5 px-5 py-5">
            <Field
              label="링크"
              hint="노출돼도 괜찮습니다. 입장 코드를 모르면 들어올 수 없습니다."
            >
              <div className="flex gap-2">
                <Input readOnly value={entryUrl} className="tabular text-[13px]" />
                <Button>복사</Button>
              </div>
            </Field>

            <Field
              label="입장 코드"
              hint="서버에는 해시만 저장됩니다. 코드가 새어 나가면 재발급하세요."
            >
              <div className="flex gap-2">
                <Input readOnly value="••••••" className="tabular" />
                <Button variant="danger">재발급</Button>
              </div>
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="권한" title="게스트" />
          <div className="px-5 py-5">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                defaultChecked={room.guestCanDraft}
                className="mt-0.5 h-4 w-4 accent-[var(--color-gold)]"
              />
              <span>
                <span className="block text-sm">게스트가 밴픽을 조작할 수 있습니다</span>
                <span className="mt-1 block text-xs leading-relaxed text-dim">
                  끄면 모든 게스트는 관전만 하고, 방장이 양 팀 밴픽을 직접
                  진행합니다.
                </span>
              </span>
            </label>
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="방 정보" title="이름과 설명" />
          <div className="space-y-4 px-5 py-5">
            <Field label="방 이름">
              <Input defaultValue={room.name} maxLength={100} />
            </Field>
            <Field label="설명">
              <Input defaultValue={room.description ?? ""} maxLength={500} />
            </Field>
            <Button variant="primary" size="sm">
              변경 사항 저장
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
