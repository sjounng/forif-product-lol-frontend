import { NavBar } from "@/components/layout/NavBar";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

/**
 * 링크 없이 코드만 들고 온 참가자용.
 * 링크(/r/{publicCode})를 타고 온 사람은 이 화면을 보지 않는다.
 *
 * TODO(A): 그룹 코드를 받아 /r/{publicCode} 로 라우팅한다.
 *          없는 코드면 여기서 바로 에러를 보여준다 — 다음 화면까지 갔다가
 *          "그런 방 없습니다"를 만나면 어디서 틀렸는지 알 수 없다.
 */
export default function JoinPage() {
  return (
    <>
      <NavBar />

      <main className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="eyebrow mb-2">참가</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              그룹 코드로 입장
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              방장에게 받은 링크가 있다면 그 링크로 바로 들어가면 됩니다.
            </p>
          </div>

          <form className="space-y-4">
            <Field label="그룹 코드" hint="링크 끝의 8자리입니다. 예: K7QM2XPA">
              <Input
                name="publicCode"
                placeholder="K7QM2XPA"
                maxLength={8}
                autoComplete="off"
                className="tabular uppercase"
              />
            </Field>

            <Button type="submit" variant="primary" className="w-full">
              다음
            </Button>
          </form>
        </div>
      </main>
    </>
  );
}
