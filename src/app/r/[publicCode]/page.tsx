import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

/**
 * 담당: A — 게스트 입장. 로그인 없이 여기로 들어온다.
 *
 * 이 화면은 방장이 아니라 참가자가 본다. 대부분 디스코드 링크를 타고 온 모바일이다.
 * 그래서 사이드바도, 로그인 유도도 없다. 코드 입력 하나뿐이어야 한다.
 *
 * TODO(A):
 *   1. enterRoom(publicCode, entryCode, nickname)
 *      → 서버가 bcrypt.compare 후 guest_sessions 발급, httpOnly 쿠키로 token 심음
 *   2. 쿠키가 이미 있으면 이 화면을 건너뛰고 바로 방으로. 새로고침·재접속해도
 *      같은 사람으로 복원되는 게 핵심이다 — 밴픽 중 브라우저가 죽어도 좌석이 유지된다.
 *   3. 코드 틀리면 필드 아래 에러. 몇 번 틀리면 잠깐 잠글 것(무차별 대입 방지).
 *   4. 없는 publicCode 면 notFound()
 */
export default async function GuestEntryPage({
  params,
}: {
  params: Promise<{ publicCode: string }>;
}) {
  const { publicCode } = await params;

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="eyebrow mb-2">{publicCode}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            내전방에 들어가기
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            방장이 알려준 입장 코드를 입력하세요. 계정은 필요 없습니다.
          </p>
        </div>

        <form className="space-y-4">
          <Field label="입장 코드">
            <Input
              name="entryCode"
              placeholder="방장에게 받은 코드"
              autoComplete="off"
              className="tabular"
            />
          </Field>

          <Field label="표시 이름" hint="밴픽 화면에서 다른 사람에게 보일 이름입니다.">
            <Input name="nickname" placeholder="닉네임" maxLength={50} />
          </Field>

          <Button type="submit" variant="primary" className="w-full">
            입장하기
          </Button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-dim">
          입장하면 관전자로 참여합니다. 방장이 밴픽 좌석에 앉히면 직접
          밴픽을 할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
