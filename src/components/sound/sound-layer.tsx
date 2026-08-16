'use client';

/**
 * SoundLayer — one delegated listener set per surface, so the interface
 * sounds (lib/sound) ride existing markup instead of every component
 * learning about audio. Mounted by the marketing layout (hover voice ON),
 * the auth layout, and the workspace shell (hover voice OFF — the product is
 * Apple-calm and speaks only when something actually changes state).
 *
 * What speaks, and with which voice:
 *  - taps: any real press of a button / link / role=button;
 *  - checks & switches: checkboxes and role=switch get the toggle pair,
 *    keyed off the state BEFORE the click flips it;
 *  - the drawer toggle gets its own open/close pair the same way;
 *  - hover (marketing only, fine pointers only): the nav pill items, the
 *    glass CTAs and dropdown rows — not every anchor on the page, which is
 *    exactly the difference between alive and noisy. `data-sfx="hover"`
 *    opts any other element in.
 *
 * Everything routes through `sfx()`, which owns the mute, the autoplay
 * unlock, the throttles and the burst cap — this component only decides
 * which gesture maps to which name.
 */

import { useEffect } from 'react';
import { armSfx, sfx } from '@/lib/sound/sfx';

const HOVER_TARGETS =
  '.nav-item, .button-05, .nav-dropdown__item, .link-row, [data-sfx="hover"]';

export function SoundLayer({ hover = true }: { hover?: boolean }) {
  useEffect(() => {
    armSfx();

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest) return;

      // Opted out — the mute button lives here: pressing "off" must be the
      // one press that makes no sound at all.
      if (target.closest('[data-sfx="off"]')) return;

      // The drawer's own pair — read BEFORE the vendored controller flips it.
      const drawerToggle = target.closest('[data-drawer-toggle]');
      if (drawerToggle) {
        sfx(drawerToggle.getAttribute('aria-expanded') === 'true' ? 'drawerClose' : 'drawerOpen');
        return;
      }

      // Checks and switches: state before the flip decides on/off.
      const switchEl = target.closest('[role="switch"]');
      if (switchEl) {
        sfx(switchEl.getAttribute('aria-checked') === 'true' ? 'toggleOff' : 'toggleOn');
        return;
      }
      const checkbox = target.closest<HTMLInputElement>('input[type="checkbox"]');
      const roleCheckbox = target.closest('[role="checkbox"]');
      if (checkbox) {
        sfx('checkbox');
        return;
      }
      if (roleCheckbox) {
        sfx('checkbox');
        return;
      }

      const pressable = target.closest('a[href], button, [role="button"]');
      if (!pressable) return;
      if ((pressable as HTMLButtonElement).disabled) return;
      sfx('tap');
    };

    let lastHovered: Element | null = null;
    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      const target = event.target as Element | null;
      const el = target?.closest?.(HOVER_TARGETS) ?? null;
      if (!el || el === lastHovered) {
        if (!el) lastHovered = null;
        return;
      }
      lastHovered = el;
      sfx('hover');
    };

    document.addEventListener('click', onClick, { capture: true, passive: true });
    if (hover) {
      document.addEventListener('pointerover', onPointerOver, { capture: true, passive: true });
    }
    return () => {
      document.removeEventListener('click', onClick, { capture: true });
      if (hover) {
        document.removeEventListener('pointerover', onPointerOver, { capture: true });
      }
    };
  }, [hover]);

  return null;
}
