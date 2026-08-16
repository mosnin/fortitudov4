/**
 * sfx — the one gate every interface sound goes through. The player
 * (`player.ts`, vendored from m1ckc3s/procedural-sounds) synthesizes;
 * this module decides WHETHER, at WHAT volume, and HOW OFTEN — which is
 * where "alive" stays separated from "obnoxious":
 *
 *  - The AudioContext is created only on a real user activation (pointerdown
 *    or keydown, once) and sounds are DROPPED — never queued — while the
 *    context is not running. Without this, hover sounds fired before the
 *    first click would stack behind the browser's autoplay gate and all
 *    release at once.
 *  - Per-sound throttles: a hover chirp can machine-gun across a nav row and
 *    a wheel can spin the /work ring through ten detents a second; each name
 *    has a floor between plays, and there is a small global concurrency cap.
 *  - Category trims on top of the curated gains — hovers sit −6dB under
 *    everything (the library's own loudness offset for the category), and a
 *    master trim keeps the whole palette under the content, not over it.
 *  - One mute, persisted (`localStorage["fortitudo:sfx"]`), honoured
 *    everywhere, exposed to React via a useSyncExternalStore-shaped
 *    subscribe. Default is ON — the palette is quiet by curation — and the
 *    toggle lives in the marketing footer and the workspace shell.
 *
 * Server-safe: every entry point no-ops without `window`.
 */

import { playSound } from './player';
import { SOUNDS, type SoundName } from './sounds';

const STORAGE_KEY = 'fortitudo:sfx';

/** Master trim over the curated gains — under the content, never over it. */
const MASTER = 0.9;

/** Per-name multipliers (taste), applied by scaling layer gains at play. */
const TRIM: Partial<Record<SoundName, number>> = {
  hover: 0.5, // the library's own −6dB category offset for hovers
  tick: 0.6,
  scrollSnap: 0.8,
  keyPress: 0.8,
};

/** Minimum ms between plays of the same name. */
const THROTTLE: Partial<Record<SoundName, number>> = {
  tap: 70,
  hover: 90,
  keyPress: 45,
  checkbox: 80,
  toggleOn: 80,
  toggleOff: 80,
  tick: 90,
  scrollSnap: 120,
  pageExit: 400,
  pageEnter: 400,
  drawerOpen: 250,
  drawerClose: 250,
  send: 300,
  success: 400,
  error: 400,
};

/** No more than this many sounds may start inside one 120ms window. */
const BURST_CAP = 4;

let ctx: AudioContext | null = null;
let unlockArmed = false;
let enabled: boolean | null = null; // resolved lazily from storage
const lastPlayed: Partial<Record<SoundName, number>> = {};
let burstWindowStart = 0;
let burstCount = 0;
const listeners = new Set<() => void>();

function readEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  if (enabled === null) {
    try {
      enabled = window.localStorage.getItem(STORAGE_KEY) !== '0';
    } catch {
      enabled = true;
    }
  }
  return enabled;
}

/** Arm the one-time activation unlock. Called by SoundLayer on mount. */
export function armSfx(): void {
  if (typeof window === 'undefined' || unlockArmed) return;
  unlockArmed = true;
  const unlock = () => {
    if (!readEnabled()) return; // stay silent-and-contextless while muted
    if (!ctx) {
      try {
        ctx = new AudioContext();
      } catch {
        return;
      }
    }
    if (ctx.state === 'suspended') void ctx.resume();
  };
  // Real activations only — hovers do not count for the autoplay gate.
  window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
  window.addEventListener('keydown', unlock, { capture: true, passive: true });
}

function scaled(name: SoundName) {
  const patch = SOUNDS[name];
  const k = MASTER * (TRIM[name] ?? 1);
  if (k === 1) return patch;
  const layers = (patch.layers || [patch]).map((l: { gain?: number }) => ({
    ...l,
    gain: (l.gain ?? 0.5) * k,
  }));
  return patch.layers ? { ...patch, layers } : layers[0];
}

/** Play a named sound, subject to every rule above. Safe to call anywhere. */
export function sfx(name: SoundName): void {
  if (typeof window === 'undefined' || !readEnabled()) return;
  // Drop, never queue: a suspended context schedules silence that all lands
  // at once when the gate lifts.
  if (!ctx || ctx.state !== 'running') {
    // A call from inside a real activation (a click handler) may create the
    // context right here — that is the normal first-sound path.
    if (!ctx && navigator.userActivation?.isActive) {
      try {
        ctx = new AudioContext();
      } catch {
        return;
      }
    }
    if (!ctx || ctx.state !== 'running') return;
  }

  const now = performance.now();
  const gap = THROTTLE[name] ?? 60;
  const last = lastPlayed[name] ?? -Infinity;
  if (now - last < gap) return;

  if (now - burstWindowStart > 120) {
    burstWindowStart = now;
    burstCount = 0;
  }
  if (++burstCount > BURST_CAP) return;

  lastPlayed[name] = now;
  try {
    playSound(scaled(name), ctx);
  } catch {
    // A synth error is never worth a broken interaction.
  }
}

/* ── the mute, React-shaped ─────────────────────────────────────────────── */

export function sfxEnabled(): boolean {
  return readEnabled();
}

export function setSfxEnabled(on: boolean): void {
  enabled = on;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
  } catch {
    /* private mode: the choice just doesn't persist */
  }
  if (on && ctx?.state === 'suspended') void ctx.resume();
  listeners.forEach((fn) => fn());
}

export function subscribeSfx(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
