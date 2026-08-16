'use client';

/**
 * The one mute. Rendered in the marketing footer's fine-print row and in the
 * workspace shell beside the theme toggle — anywhere the interface speaks,
 * the visitor can tell it not to. The preference persists in localStorage
 * and every surface honours it through `sfx()`.
 *
 * Toggling ON plays the toggle sound itself (instant proof of what was just
 * enabled); toggling OFF is silent, which is the whole point of pressing it.
 */

import { useSyncExternalStore } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { setSfxEnabled, sfx, sfxEnabled, subscribeSfx } from '@/lib/sound/sfx';

export function SoundToggle({ className }: { className?: string }) {
  const on = useSyncExternalStore(subscribeSfx, sfxEnabled, () => true);

  const flip = () => {
    const next = !on;
    setSfxEnabled(next);
    if (next) sfx('toggleOn');
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      data-sfx="off"
      aria-label={on ? 'Turn interface sounds off' : 'Turn interface sounds on'}
      onClick={flip}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1.5 text-[12px] transition-colors',
        className,
      )}
    >
      {on ? (
        <Volume2 className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <VolumeX className="h-3.5 w-3.5" aria-hidden />
      )}
      <span>Sound {on ? 'on' : 'off'}</span>
    </button>
  );
}
