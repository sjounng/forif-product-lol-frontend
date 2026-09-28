"use client";

import { useState, type FormEvent } from "react";
import { useRoom } from "@/components/group/RoomShell";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import { rotatePublicCode, updateRoom } from "@/lib/api/rooms";
import { deleteRoom, leaveRoom } from "@/lib/api/rooms";
import { useRouter } from "next/navigation";

export default function RoomSettingsPage() {
  const { room, setRoom } = useRoom();
  const router = useRouter();
  const canManage = room.myRole === "GROUP_OWNER" || room.myRole === "GROUP_MANAGER";
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"rotate" | "leave" | null>(null);
  const [confirmSaving, setConfirmSaving] = useState(false);
  const entryUrl =
    typeof window === "undefined"
      ? `/r/${room.publicCode}`
      : `${window.location.origin}/r/${room.publicCode}`;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    const data = new FormData(event.currentTarget);
    const newPassword = String(data.get("entryPassword"));
    try {
      const updated = await updateRoom(room.id, {
        name: String(data.get("name")),
        description: String(data.get("description")),
        guestAdmissionEnabled: data.get("guestAdmissionEnabled") === "on",
        ...(newPassword ? { entryPassword: newPassword } : {}),
      });
      setRoom(updated);
      setMessage("변경 사항을 저장했습니다.");
      event.currentTarget.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "설정을 저장하지 못했습니다.");
    }
  }

  async function rotate() {
    try {
      setConfirmSaving(true);
      const updated = await rotatePublicCode(room.id);
      setRoom(updated);
      setMessage("공개 코드를 재발급했습니다.");
      setConfirmAction(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "코드를 재발급하지 못했습니다.");
      setConfirmAction(null);
    } finally {
      setConfirmSaving(false);
    }
  }

  async function clearPassword() {
    try {
      const updated = await updateRoom(room.id, { entryPassword: "" });
      setRoom(updated);
      setMessage("입장 암호를 해제했습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "암호를 해제하지 못했습니다.");
    }
  }

  async function leaveOrDelete() {
    const owner = room.myRole === "GROUP_OWNER";
    try {
      setConfirmSaving(true);
      if (owner) await deleteRoom(room.id);
      else await leaveRoom(room.id);
      router.replace("/rooms");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : owner ? "그룹을 삭제하지 못했습니다." : "그룹을 탈퇴하지 못했습니다.");
      setConfirmAction(null);
      setConfirmSaving(false);
    }
  }

  return (
    <main className="px-8 py-8">
      <div className="mb-8">
        <p className="section-label mb-2">설정</p>
        <h1 className="text-xl font-semibold tracking-tight">그룹 설정</h1>
      </div>

      {error && <p className="mb-4 text-sm text-loss">{error}</p>}
      {message && <p className="mb-4 text-sm text-gain">{message}</p>}

      <div className="space-y-6">
        {canManage && <Card>
          <CardHeader eyebrow="참가자에게 공유" title="초대 링크" />
          <div className="space-y-4 px-5 py-5">
            <Field label="링크" hint="코드를 재발급하면 이전 링크의 신규 입장이 차단됩니다.">
              {/* Input 이 w-full 이라 Button 을 shrink-0 로 막지 않으면 글자 폭 아래로 찌그러져 세로로 쌓인다 */}
              <div className="flex gap-2">
                <Input readOnly value={entryUrl} className="tabular min-w-0 text-[13px]" />
                <Button
                  type="button"
                  className="shrink-0 whitespace-nowrap"
                  onClick={() => void navigator.clipboard.writeText(entryUrl)}
                >
                  복사
                </Button>
              </div>
            </Field>
            <Button type="button" variant="danger" size="sm" onClick={() => setConfirmAction("rotate")}>
              공개 코드 재발급
            </Button>
          </div>
        </Card>}

        {canManage && <Card>
          <CardHeader eyebrow="그룹 정보" title="이름·설명·입장 정책" />
          <form className="space-y-4 px-5 py-5" onSubmit={save}>
            {/* 페이지가 전체 폭이 되면서 입력창이 화면 끝까지 늘어지므로 2열로 배치한다 */}
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="그룹 이름">
                <Input name="name" defaultValue={room.name} maxLength={100} required />
              </Field>
              <Field label="설명">
                <Input name="description" defaultValue={room.description ?? ""} maxLength={500} />
              </Field>
              <Field
                label="새 입장 암호"
                hint={room.entryPasswordProtected ? "현재 암호를 바꾸려면 새 암호를 입력하세요." : "비워 두면 암호를 사용하지 않습니다."}
              >
                <Input name="entryPassword" type="password" minLength={4} maxLength={72} />
              </Field>
              <Checkbox
                name="guestAdmissionEnabled"
                defaultChecked={room.guestAdmissionEnabled}
                className="self-center"
              >
                신규 게스트 입장 허용
              </Checkbox>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="primary" size="sm">변경 사항 저장</Button>
              {room.entryPasswordProtected && (
                <Button type="button" size="sm" onClick={() => void clearPassword()}>
                  입장 암호 해제
                </Button>
              )}
            </div>
          </form>
        </Card>}

        <Card className="border-loss/30">
          <CardHeader eyebrow="주의" title={room.myRole === "GROUP_OWNER" ? "그룹 삭제" : "그룹 탈퇴"} />
          <div className="px-5 py-5">
            <p className="mb-4 text-sm leading-relaxed text-muted">{room.myRole === "GROUP_OWNER" ? "그룹을 보관 상태로 전환해 더 이상 접근하거나 참가할 수 없게 합니다." : "탈퇴하면 참가자 목록에서 사라지고 다시 초대받기 전에는 그룹에 접근할 수 없습니다."}</p>
            <Button variant="danger" onClick={() => setConfirmAction("leave")}>{room.myRole === "GROUP_OWNER" ? "그룹 삭제" : "그룹 탈퇴"}</Button>
          </div>
        </Card>
      </div>
      <Dialog
        open={confirmAction !== null}
        title={
          confirmAction === "rotate"
            ? "공개 코드를 재발급할까요?"
            : room.myRole === "GROUP_OWNER"
              ? "그룹을 삭제할까요?"
              : "그룹에서 탈퇴할까요?"
        }
        description={
          confirmAction === "rotate"
            ? "이전 초대 링크와 코드로는 새로 입장할 수 없습니다."
            : room.myRole === "GROUP_OWNER"
              ? "신규 접근은 차단되며 기존 경기 기록은 보존됩니다."
              : "참가자 목록에서 사라지고 다시 초대받기 전에는 접근할 수 없습니다."
        }
        confirmLabel={confirmAction === "rotate" ? "재발급" : room.myRole === "GROUP_OWNER" ? "그룹 삭제" : "탈퇴"}
        danger
        pending={confirmSaving}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => void (confirmAction === "rotate" ? rotate() : leaveOrDelete())}
      />
    </main>
  );
}
