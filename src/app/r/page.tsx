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
          <h1 className="mb-8 text-2xl font-semibold tracking-tight">
            그룹 코드로 입장
          </h1>
          <form className="space-y-4" onSubmit={submit}>
            <Field label="그룹 코드">
              <Input
                name="publicCode"
                maxLength={8}
                autoComplete="off"
                placeholder="K7QM2XPA"
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
