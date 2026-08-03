"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { LanePreferenceIcons } from "@/components/ui/LaneIcon";
import { fetchProfile, linkRiotAccount, updateProfile } from "@/lib/api/auth";
import { formatRank } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import type { UserProfile } from "@/types";

export function ProfileDialog({ open, onClose }: { open: boolean; onClose(): void }) {
  const { user, updateCurrentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [saving, setSaving] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    void fetchProfile()
      .then(setProfile)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "회원정보를 불러오지 못했습니다."));
  }, [open, user]);

  if (!open || !user) return null;

  async function saveName(event: FormEvent) {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const updated = await updateProfile(displayName);
      updateCurrentUser(updated);
      setProfile((current) => current ? { ...current, user: updated } : current);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "닉네임을 변경하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function connectRiot(event: FormEvent) {
    event.preventDefault();
    try {
      setLinking(true);
      setError(null);
      const linked = await linkRiotAccount(gameName, tagLine);
      setProfile(linked);
      setGameName("");
      setTagLine("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Riot 계정을 연동하지 못했습니다.");
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-4" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label="회원정보"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-line bg-surface shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="eyebrow">계정</p>
            <h2 className="mt-1 text-lg font-semibold">회원정보</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="닫기">닫기</Button>
        </header>

        <div className="space-y-6 px-5 py-5">
          <form className="space-y-3" onSubmit={saveName}>
            <Field label="사이트 닉네임">
              <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={50} required />
            </Field>
            <p className="text-xs text-dim">{user.email}</p>
            <Button type="submit" size="sm" variant="primary" disabled={saving || !displayName.trim()}>
              {saving ? "변경 중…" : "닉네임 변경"}
            </Button>
          </form>

          <div className="border-t border-line-soft pt-5">
            <h3 className="text-sm font-semibold">Riot 계정</h3>
            {profile?.riotAccount ? (
              <div className="mt-3 rounded-lg border border-line bg-bg px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{profile.riotAccount.gameName}#{profile.riotAccount.tagLine}</p>
                    <p className="mt-1 text-sm text-muted">솔로랭크 {formatRank(profile.riotAccount)}</p>
                  </div>
                  <LanePreferenceIcons primary={profile.primaryLane} secondary={profile.secondaryLane} showLabels />
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">연동된 Riot 계정이 없습니다.</p>
            )}

            <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_110px_auto]" onSubmit={connectRiot}>
              <Input value={gameName} onChange={(event) => setGameName(event.target.value)} placeholder="게임 이름" minLength={3} maxLength={32} required />
              <Input value={tagLine} onChange={(event) => setTagLine(event.target.value)} placeholder="KR1" minLength={2} maxLength={10} required />
              <Button type="submit" size="sm" disabled={linking} className="h-10">
                {linking ? "확인 중…" : profile?.riotAccount ? "다시 연동" : "연동"}
              </Button>
            </form>
            <p className="mt-2 text-xs leading-relaxed text-dim">연동 시 솔로랭크 티어·전적과 최근 솔로랭크 포지션을 함께 갱신합니다.</p>
          </div>

          {error && <p role="alert" className="text-sm text-loss">{error}</p>}
        </div>
      </section>
    </div>
  );
}
