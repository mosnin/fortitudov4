'use client';

/**
 * The invite prompt that stands in front of the Clerk widgets on `/sign-in`
 * and `/sign-up` until this browser has presented a valid code
 * (`/api/invite` sets the `invite_ok` cookie; the SERVER page reads it and
 * decides which side renders, so the gate cannot be skipped by editing the
 * client). `router.refresh()` after success re-runs that server decision in
 * place — same URL, form appears, redirect params intact.
 *
 * Styled like the auth pages it lives in: typography helpers, token colours,
 * no new vocabulary. The error line is a live region so a screen reader
 * hears a rejected code without hunting for it.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BODY_MUTED } from '@/lib/typography';
import { sfx } from '@/lib/sound/sfx';
import { cn } from '@/lib/utils';

export function InviteGate() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        sfx('success'); // the door opens
        router.refresh();
        return;
      }
      setError(data.error ?? 'That code did not match.');
      sfx('error');
    } catch {
      setError('Could not check the code. Try again.');
      sfx('error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full space-y-4">
      <label
        htmlFor="invite-code"
        className="block text-sm font-medium text-foreground"
      >
        Invite code?
      </label>
      <p className={BODY_MUTED}>
        Fortitudo is invite-only right now. Enter the code you were given to
        continue.
      </p>
      <input
        id="invite-code"
        name="invite-code"
        type="text"
        autoComplete="off"
        autoFocus
        value={code}
        onChange={(event) => setCode(event.target.value)}
        placeholder="Your invite code"
        className="h-11 w-full rounded-[4px] border border-[var(--fx-faint)] bg-transparent px-4 text-[14px] text-[var(--fx-white)] placeholder:text-[var(--fx-faint)] focus:border-[var(--fx-yellow)] focus:outline-none"
      />
      {error ? (
        <p role="alert" aria-live="polite" className="text-[13px] text-red-400">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy || code.trim().length === 0}
        className={cn(
          'inline-flex h-11 w-full items-center justify-center rounded-[4px] bg-[var(--fx-yellow)] px-6 text-[14px] font-medium text-[var(--fx-on-yellow)] transition-colors duration-200 hover:bg-[var(--fx-yellow-hover)]',
          (busy || code.trim().length === 0) && 'cursor-not-allowed opacity-60',
        )}
      >
        {busy ? 'Checking…' : 'Continue'}
      </button>
    </form>
  );
}
