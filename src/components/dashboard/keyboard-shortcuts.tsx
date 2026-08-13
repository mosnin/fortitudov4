'use client';

/**
 * The keyboard-shortcuts reference on /settings.
 *
 * Two halves that explain each other: a list of what the portal does, and a
 * board that shows where. Hovering or focusing a row rings the keys it uses,
 * and the board also answers the reader's own keyboard, so pressing ⌘K here
 * both opens the palette and lights the two keys that did it.
 *
 * The list is the source of truth and it is short on purpose. Every entry below
 * is a binding that exists in the code — `command-palette.tsx` for the first
 * four, `helix-thread.tsx` / `helix-client-panel.tsx` for the last. Nothing is
 * aspirational: a shortcuts page that lists a shortcut the app does not have is
 * worse than no shortcuts page.
 *
 * On the modifier: the handlers all test `metaKey || ctrlKey`, so ⌘ and Ctrl
 * genuinely both work, on every platform. That is why this renders "⌘ / Ctrl"
 * and rings both keys rather than sniffing the platform — it is the accurate
 * description, and it keeps the server and the first client render identical,
 * which is the thing that matters here (see `use-reduced-motion-safe.ts` for
 * what happens when a client-only fact reaches the SSR markup).
 */

import { useState } from 'react';
import { Keyboard, KEYCODE } from '@/components/ui/keyboard';
import { SECTION_LABEL } from '@/lib/typography';
import { cn } from '@/lib/utils';

type Shortcut = {
  /** What it does, in the reader's terms. */
  action: string;
  /** The chips, left to right. */
  caps: string[];
  /** Which physical keys to ring. */
  keys: readonly KEYCODE[];
};

const SHORTCUTS: Shortcut[] = [
  {
    action: 'Open the command palette',
    caps: ['⌘ / Ctrl', 'K'],
    keys: [KEYCODE.MetaLeft, KEYCODE.ControlLeft, KEYCODE.KeyK],
  },
  {
    action: 'Move through the results',
    caps: ['↑', '↓'],
    keys: [KEYCODE.ArrowUp, KEYCODE.ArrowDown],
  },
  {
    action: 'Open the highlighted result',
    caps: ['Enter'],
    keys: [KEYCODE.Enter],
  },
  {
    action: 'Close the palette or search',
    caps: ['Esc'],
    keys: [KEYCODE.Escape],
  },
  {
    action: 'Send a message to Helix',
    caps: ['⌘ / Ctrl', 'Enter'],
    keys: [KEYCODE.MetaLeft, KEYCODE.ControlLeft, KEYCODE.Enter],
  },
];

const NO_KEYS: readonly KEYCODE[] = [];

export function KeyboardShortcuts() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-6">
      <p className={SECTION_LABEL}>Keyboard shortcuts</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Hover a shortcut to find it on the board. The board answers your own
        keyboard too.
      </p>

      {/* Stacked, not side by side. The board is a fixed ~800px picture of a
          physical object — it does not reflow — so a column narrow enough to
          read the list beside it is a column that clips the right-hand third
          of the keyboard off. Full width, list above. */}
      <div className="mt-5 space-y-8">
        <ul className="max-w-xl divide-y divide-border/60 border-y border-border/60">
          {SHORTCUTS.map((shortcut, index) => (
            <li key={shortcut.action}>
              {/* A button, not a bare row: the highlight is a real affordance,
                  so it has to be reachable by keyboard — on a shortcuts page
                  of all places. It navigates nowhere, hence type="button". */}
              <button
                type="button"
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive((c) => (c === index ? null : c))}
                onFocus={() => setActive(index)}
                onBlur={() => setActive((c) => (c === index ? null : c))}
                className={cn(
                  'flex w-full items-center justify-between gap-4 py-3 text-left transition-colors',
                  active === index ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <span className="text-sm">{shortcut.action}</span>
                <span className="flex shrink-0 items-center gap-1">
                  {shortcut.caps.map((cap) => (
                    <kbd
                      key={cap}
                      /* `font-sans` explicitly: the product surface has no
                         mono voice, and `<kbd>` defaults to monospace in every
                         browser's UA stylesheet. */
                      className="rounded-[4px] border border-border bg-muted/60 px-1.5 py-0.5 font-sans text-[11px] font-medium text-foreground"
                    >
                      {cap}
                    </kbd>
                  ))}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* `aria-hidden` because the list above already says everything the
            board says, and a screen reader walking 79 unlabelled key buttons
            would be reading furniture. Sound is off: the upstream default
            points at a 1.9MB `/sounds/sound.ogg` this repo does not vendor,
            and a settings page that clicks at you is not the house style.

            The board is 830×306 and does not reflow, so below ~900px it is
            scrolled rather than wrapped — inside this box, never by the page.

            `scale` shrinks what is painted but not the layout box, so the
            inner div carries the SCALED size at each breakpoint (830/631/515
            wide, 306/233/190 tall). Without that the box stays 830×306 at
            every size, and the small board gets a scrollbar that runs 300px
            past its own right edge plus a hole underneath it. */}
        <div aria-hidden className="overflow-x-auto">
          <div className="h-[190px] w-[515px] overflow-hidden sm:h-[233px] sm:w-[631px] lg:h-[306px] lg:w-[830px]">
            <Keyboard
              theme="classic"
              enableSound={false}
              highlightedKeys={active === null ? NO_KEYS : SHORTCUTS[active].keys}
              className="origin-top-left scale-[0.62] sm:scale-[0.76] lg:scale-100"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
