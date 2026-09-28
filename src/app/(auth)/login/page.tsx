"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    try {
      await signIn(String(data.get("email")), String(data.get("password")));
      router.replace("/rooms");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "로그인하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">로그인</h1>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="이메일">
          <Input type="email" name="email" autoComplete="email" required />
        </Field>
        <Field label="비밀번호">
          <Input type="password" name="password" autoComplete="current-password" required />
        </Field>
        {error && <p className="text-sm text-loss">{error}</p>}
        <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
          {submitting ? "로그인 중…" : "로그인"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px]">
        <Link href="/signup" className="text-muted hover:text-text">
          회원가입
        </Link>
      </p>
    </>
  );
}
