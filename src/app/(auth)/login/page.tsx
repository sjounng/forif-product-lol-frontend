import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

/**
 * 담당: A — 백엔드가 이미 완성된 유일한 화면이다.
 *
 * TODO(A):
 *   1. "use client" 로 바꾸고 form 상태를 잡는다
 *   2. submit → login(email, password)
 *   3. 성공: accessToken 은 메모리(setAccessToken), refreshToken 은 httpOnly 쿠키로.
 *      localStorage 에 넣지 말 것 — XSS 한 방에 계정이 털린다.
 *   4. 실패: 백엔드가 주는 message 를 폼 위에 그대로 노출 (401 "이메일 또는 비밀번호가 올바르지 않습니다.")
 *   5. 성공 후 router.replace("/rooms")
 */
export default function LoginPage() {
  return (
    <>
      <div className="mb-8">
        <p className="eyebrow mb-2">내전하냥</p>
        <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          방을 만들고 관리하려면 로그인이 필요합니다. 내전에 참여만 할
          사람은 방장이 준 링크로 바로 들어가면 됩니다.
        </p>
      </div>

      <form className="space-y-4">
        <Field label="이메일">
          <Input type="email" name="email" placeholder="owner@example.com" autoComplete="email" />
        </Field>

        <Field label="비밀번호">
          <Input type="password" name="password" autoComplete="current-password" />
        </Field>

        {/* TODO(A): 에러 메시지 자리 — 백엔드 message 를 그대로 */}

        <Button type="submit" variant="primary" className="w-full">
          로그인
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        아직 계정이 없나요?{" "}
        <Link href="/signup" className="text-gold hover:underline">
          회원가입
        </Link>
      </p>
    </>
  );
}
