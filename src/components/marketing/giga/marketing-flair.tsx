'use client';

/**
 * The two site-wide flair strips, mounted once in the marketing layout so
 * every logged-out page carries them: an LED ticker of the five offerings
 * above the footer, and the ASCII flame below it — the page literally ends
 * in embers. Both are vendored OriginKit pieces (`components/originkit/
 * flair/`); this file is the only place they get their colours and copy,
 * which keeps the vendored files config-free.
 *
 * COLOUR DISCIPLINE. Both draw with literal hex because a canvas cannot
 * resolve a CSS variable; the literals are the `--fx-*` token values and are
 * commented as such — change a token, change them here. The flame's ramp is
 * charcoal→yellow→paper: brand fire, not campfire orange, because the only
 * hues this surface owns are charcoal, yellow and white.
 *
 * TICKER CONTENT is the five offerings from `lib/services.ts` — the same
 * module the product sells from, so the belt can never advertise a sixth
 * thing. Decorative and marked so: both strips are `aria-hidden` (the
 * offerings are read out properly in the nav and on /services; a MARQUEE
 * repeating them forever is exactly what a screen reader should not sit
 * through).
 *
 * REDUCED MOTION: the ticker gets `speed 0, flicker off` — a static lit
 * board (the safe hook flips post-hydration; only canvas drawing changes,
 * never SSR markup). The flame handles the preference itself: it draws one
 * frame and never schedules another (vendored behaviour, kept).
 */

import { useReducedMotionSafe } from '@/hooks/use-reduced-motion-safe';
import { services } from '@/lib/services';
import LEDTicker from '@/components/originkit/flair/led-ticker';
import AsciiFire from '@/components/originkit/flair/ascii-flame';

/** Token values, for the two canvases that cannot read CSS variables. */
const YELLOW = '#f8cd02'; // --fx-yellow
const CHARCOAL = '#0f0f12'; // --fx-charcoal

export function OfferingsTicker() {
  const reduce = useReducedMotionSafe();
  return (
    <div
      aria-hidden
      className="h-12 border-t border-[var(--fx-hairline)] bg-[var(--fx-charcoal)]"
    >
      <LEDTicker
        items={services.map((service) => service.name)}
        separator="●"
        speed={reduce ? 0 : 14}
        textSize={22}
        dotSize={2.4}
        dotQuantity={10}
        spread={1}
        onColor={YELLOW}
        offColor="rgba(255,255,255,0.05)"
        glow
        glowOptions={{ strength: 45, size: 8 }}
        flicker={!reduce}
        flickerOptions={{ strength: 25, speed: 40 }}
      />
    </div>
  );
}

export function FlameOutro() {
  return (
    <div aria-hidden className="bg-[var(--fx-charcoal)]">
      <AsciiFire
        intensity={82}
        thickness={2}
        windDirection="right"
        windForce={10}
        decay={13}
        turbulence={30}
        pulse
        embers
        sparks
        charset="classic"
        palette="custom"
        shades={[
          CHARCOAL, // the coldest cell is the page itself
          '#2a2408',
          '#5c4d04',
          '#8f7503',
          '#c2a002',
          YELLOW,
          '#fff1aa', // the hottest tips bleach toward paper
        ]}
        sparkColor="#fff1aa"
        backgroundColor={CHARCOAL}
        style={{ height: 180 }}
      />
    </div>
  );
}
