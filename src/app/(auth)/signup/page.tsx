"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    setSubmitting(true);
    try {
      await signUp(
        String(data.get("email")),
        password,
        String(data.get("displayName")),
      );
      router.replace("/rooms");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "가입하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <p className="eyebrow mb-2">내전하냥</p>
        <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          그룹을 만들고 팀장으로 활동할 계정을 만듭니다.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="이메일">
          <Input type="email" name="email" autoComplete="email" required />
        </Field>
        <Field label="표시 이름">
          <Input type="text" name="displayName" maxLength={50} required />
        </Field>
        <Field label="비밀번호" hint="8자 이상">
          <Input type="password" name="password" autoComplete="new-password" minLength={8} required />
        </Field>
        {error && <p className="text-sm text-loss">{error}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? "계정 생성 중…" : "계정 만들기"}
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
