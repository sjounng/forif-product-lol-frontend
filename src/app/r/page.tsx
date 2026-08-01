"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/layout/NavBar";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function JoinPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const code = String(data.get("publicCode")).trim().toUpperCase();
    if (!/^[A-Z2-9]{8}$/.test(code)) {
      setError("그룹 코드는 영문 대문자와 숫자로 된 8자리입니다.");
      return;
    }
    router.push(`/r/${code}`);
  }

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
              초대 링크 끝의 공개 코드로 게스트 입장 화면을 엽니다.
            </p>
          </div>
          <form className="space-y-4" onSubmit={submit}>
            <Field label="그룹 코드" hint="8자리입니다. 예: K7QM2XPA">
              <Input
                name="publicCode"
                maxLength={8}
                autoComplete="off"
                className="tabular uppercase"
                required
              />
            </Field>
            {error && <p className="text-sm text-loss">{error}</p>}
            <Button type="submit" variant="primary" className="w-full">
              다음
            </Button>
          </form>
        </div>
      </main>
    </>
  );
}
