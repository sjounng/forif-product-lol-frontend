import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

/**
 * 담당: A
 *
 * TODO(A):
 *   1. signup(email, password, displayName) → 201
 *   2. 409 "이미 가입된 이메일입니다." 를 이메일 필드 아래에 표시
 *   3. 비밀번호 8자 이상 — 백엔드 @Size(min=8) 과 맞출 것. 클라에서도 먼저 막는다
 *   4. 가입 성공하면 바로 로그인시켜서 /rooms 로 (별도 로그인 화면 다시 거치게 하지 말 것)
 */
export default function SignupPage() {
  return (
    <>
      <div className="mb-8">
        <p className="eyebrow mb-2">내전하냥</p>
        <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          방장 계정을 만듭니다. 참가자는 계정 없이 입장 코드로 들어옵니다.
        </p>
      </div>

      <form className="space-y-4">
        <Field label="이메일">
          <Input type="email" name="email" placeholder="owner@example.com" autoComplete="email" />
        </Field>

        <Field label="표시 이름" hint="방 화면에서 방장으로 보일 이름입니다.">
          <Input type="text" name="displayName" placeholder="방장" maxLength={50} />
        </Field>

        <Field label="비밀번호" hint="8자 이상">
          <Input type="password" name="password" autoComplete="new-password" />
        </Field>

        <Button type="submit" variant="primary" className="w-full">
          계정 만들기
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="text-gold hover:underline">
          로그인
        </Link>
      </p>
    </>
  );
}
