'use client';

import { useEffect, useRef, useState } from 'react';

import StickerDrag from '@/components/originkit/ui/cta-01/draggable-sticker';

/**
 * One note on the pinboard — the peelable, draggable sticker from the OriginKit
 * drop, wearing our paper instead of its own.
 *
 * The drop shipped each note as a square SVG under `/originkit/cta-01/`: the
 * paper, its torn edge, the folded corner, the clip AND the handwriting, all
 * baked into one file. None of those files exist — the whole asset folder
 * failed to download — and even if they had, they could not have shipped:
 * every one of them carries a filler quote burnt into the artwork, in a script
 * face, in the drop's own colours. Our notes have to carry OUR words, in OUR
 * one family, on OUR paper.
 *
 * So the texture is drawn here instead, at mount, from what the page itself
 * says the palette and the display face are. `StickerDrag` uploads whatever it
 * is handed as a WebGL texture and deforms it on a 32 x 32 mesh, and it does
 * not care whether the pixels came off the network or out of a canvas — so the
 * peel, the drag, the velocity tilt, the settle and the z-index lift are the
 * drop's, unchanged, and only the pixels are ours.
 *
 * Four things from the drop's own notes on those SVGs still hold, because they
 * are facts about the engine rather than about the files:
 *
 *  - **The texture is drawn at 3x.** What reaches `texImage2D` is a bitmap at
 *    the image's intrinsic size, and the vector-ness of an SVG stops helping
 *    the moment it rasterises. Drawn 1:1 the note would upload at half the
 *    device resolution it is shown at and read soft.
 *  - **The box is square.** The engine scales the mesh by
 *    `min(w, h) / (that side + padding)` and applies the one factor to both
 *    axes, so a non-square box draws the art short across.
 *  - **The rotation lives in the artwork, not on the element.** A CSS rotate on
 *    the host would rotate the drag maths with it; the paper is turned inside
 *    its square box instead, which is exactly what the drop's SVGs did. It is
 *    also where the "handwritten" look has to come from — that, and the ruled
 *    paper. Never a script or serif face: there is no serif on this surface.
 *  - **The resting shadow is the engine's**, not baked into the art, so the two
 *    do not stack into a double drop.
 *
 * The text is drawn, so it is not selectable, and the host is a `role="img"`
 * that carries the same words as its label — the way the drop's own notes were
 * announced.
 */

/** The engine wants pixels; the layout is a set of breakpoint classes. */
const TEXTURE_SCALE = 3;
/** A ceiling, so a wide note does not upload a needlessly large texture. */
const TEXTURE_MAX = 1024;
/** The paper, as a fraction of its square box. The rest is turning room. */
const SHEET = 0.8;

/**
 * The engine's own resting shadow, and the lift it grows into while held.
 *
 * Neutral black at low alpha rather than a palette colour, and that is not a
 * missed token: a shadow is the absence of light on the charcoal underneath,
 * and tinting it yellow or charcoal would paint a coloured smear rather than
 * darken what is already there.
 */
const REST_SHADOW = '0px 2px 4px rgba(0, 0, 0, 0.34)';
const DRAG_SHADOW = '0px 18px 22px rgba(0, 0, 0, 0.34)';

/**
 * The palette, read off the DOM rather than written here.
 *
 * The note is painted into a canvas, and a canvas cannot resolve `var()` — so
 * the three tokens are resolved against the host element and handed over as
 * literal colours. That keeps the skin in `globals.css` where the rest of the
 * surface keeps it: change `--fx-yellow` there and the paper changes with it.
 */
type Paint = {
  /** `--fx-yellow` — the paper. Yellow is a surface. */
  paper: string;
  /** `--fx-on-yellow` — every mark on it. Text on yellow is always black. */
  ink: string;
  /** `--fx-charcoal` — the pin head, the one thing that is not the paper. */
  pin: string;
  /** `var(--font-title)`, resolved. One family on this surface. */
  family: string;
};

/**
 * Only reached if a note renders outside `[data-marketing-shell]`, where the
 * `--fx-*` block does not exist. That is a mounting bug rather than a state to
 * design for, but a note that paints itself in empty strings is invisible and
 * says nothing about why. Values mirror the shell block in `globals.css`.
 */
const FALLBACK = {
  paper: '#f8cd02',
  ink: '#0d0d0d',
  pin: '#1b1b1d',
} as const;

function readPaint(host: HTMLElement): Paint {
  const styles = getComputedStyle(host);
  const token = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  /* `getComputedStyle` substitutes `var()`, so a throwaway span set to the
     display face reports back the family the shell actually resolved it to. */
  const probe = document.createElement('span');
  probe.style.fontFamily = 'var(--font-title), ui-sans-serif, system-ui, sans-serif';
  host.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily;
  probe.remove();

  return {
    paper: token('--fx-yellow', FALLBACK.paper),
    ink: token('--fx-on-yellow', FALLBACK.ink),
    pin: token('--fx-charcoal', FALLBACK.pin),
    family,
  };
}

/** A squared path — 4px, the one radius on this surface. */
function sheetPath(
  ctx: CanvasRenderingContext2D,
  side: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.arcTo(side, 0, side, side, radius);
  ctx.arcTo(side, side, 0, side, radius);
  ctx.arcTo(0, side, 0, 0, radius);
  ctx.arcTo(0, 0, side, 0, radius);
  ctx.closePath();
}

/** Greedy wrap. Returns the lines, or null if the text will not fit the box. */
function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] | null {
  const lines: string[] = [];
  let line = '';

  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
    // A single word wider than the sheet cannot be broken by this pass.
    if (ctx.measureText(line).width > maxWidth) return null;
  }

  if (line) lines.push(line);
  return lines;
}

/**
 * Paint one note and hand back a data URL.
 *
 * Everything is stated in CSS pixels and multiplied up by `scale`, so the type
 * on a note is the same size on a phone as on a desktop — the note gets bigger,
 * the handwriting does not. Only the paper and its furniture are fractions of
 * the sheet.
 */
function paintNote(
  text: string,
  rotate: number,
  size: number,
  paint: Paint,
): string {
  const side = Math.min(TEXTURE_MAX, Math.round(size * TEXTURE_SCALE));
  const scale = side / size;
  const px = (value: number) => value * scale;

  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const sheet = side * SHEET;
  const padding = sheet * 0.1;
  const textTop = sheet * 0.3;

  // Turn the paper inside its square box, then work in the sheet's own frame.
  ctx.translate(side / 2, side / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.translate(-sheet / 2, -sheet / 2);

  sheetPath(ctx, sheet, px(4));
  ctx.fillStyle = paint.paper;
  ctx.fill();

  // Fit the words: 15px, then a point at a time down to 12, and 11 if none of
  // those took. It stops there rather than shrinking until anything fits — a
  // note whose type keeps dropping has too much on it, and that is a copy
  // problem the section should show rather than absorb.
  let fontSize = px(15);
  let lines: string[] | null = null;
  for (let step = 0; step < 4; step += 1) {
    ctx.font = `600 ${fontSize}px ${paint.family}`;
    const candidate = wrap(ctx, text, sheet - padding * 2);
    if (candidate && candidate.length * fontSize * 1.4 <= sheet - textTop - padding) {
      lines = candidate;
      break;
    }
    fontSize -= px(1);
  }
  ctx.font = `600 ${fontSize}px ${paint.family}`;
  const rows = lines ?? wrap(ctx, text, sheet - padding * 2) ?? [text];
  const leading = fontSize * 1.4;

  // Everything from here is inside the paper.
  ctx.save();
  sheetPath(ctx, sheet, px(4));
  ctx.clip();

  // Ruled paper — where the "handwritten" reading comes from, with the tilt.
  ctx.strokeStyle = paint.ink;
  ctx.lineWidth = px(1);
  ctx.globalAlpha = 0.1;
  for (let y = textTop + leading; y < sheet - padding * 0.5; y += leading) {
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(sheet - padding, y);
    ctx.stroke();
  }

  // The folded corner.
  const fold = sheet * 0.12;
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = paint.ink;
  ctx.beginPath();
  ctx.moveTo(sheet - fold, sheet);
  ctx.lineTo(sheet, sheet - fold);
  ctx.lineTo(sheet, sheet);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.22;
  ctx.beginPath();
  ctx.moveTo(sheet - fold, sheet);
  ctx.lineTo(sheet, sheet - fold);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // The words.
  ctx.fillStyle = paint.ink;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  rows.forEach((row, index) => {
    ctx.fillText(row, padding, textTop + leading * (index + 1) - px(5));
  });

  ctx.restore();

  // The paper's own edge, redrawn over the rules so they stop at it.
  ctx.strokeStyle = paint.ink;
  ctx.globalAlpha = 0.14;
  ctx.lineWidth = px(1);
  sheetPath(ctx, sheet, px(4));
  ctx.stroke();
  ctx.globalAlpha = 1;

  // The pin. A dot is the one circle this surface still allows.
  ctx.fillStyle = paint.pin;
  ctx.beginPath();
  ctx.arc(sheet / 2, sheet * 0.13, px(5), 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL('image/png');
}

export type StickerNoteProps = {
  /** What the note says. Our copy, drawn into the paper and announced with it. */
  text: string;
  /** Degrees of turn, baked into the artwork. Composition, not a corner radius. */
  rotate: number;
  /** Placement and per-breakpoint width. No `z-*`: see `pinboard-cta`. */
  className?: string;
  /**
   * `false` under `prefers-reduced-motion`. The note still drags — that is the
   * visitor moving a thing, not the page animating at them — but the paper does
   * not peel, lift or tilt on the way.
   */
  peel?: boolean;
};

export const StickerNote = ({
  text,
  rotate,
  className = '',
  peel = true,
}: StickerNoteProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);
  const [texture, setTexture] = useState('');

  /* The engine needs its box in pixels, so the host reserves the note, measures
     itself, and only then mounts. The measurement is rounded on the way out: the
     engine sizes its backing store from it and a fractional width lands that on
     an odd pixel count. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    setSize(Math.round(host.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) =>
      setSize(Math.round(entry.contentRect.width)),
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  /* Painted after the fonts land. Drawn before them, `fillText` falls back to
     the system sans and bakes the wrong face into a texture nothing repaints. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host || size <= 0) return;

    let live = true;
    const draw = () => {
      if (!live || !hostRef.current) return;
      setTexture(paintNote(text, rotate, size, readPaint(hostRef.current)));
    };

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(draw);
    } else {
      draw();
    }

    return () => {
      live = false;
    };
  }, [size, text, rotate]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={`Sticky note: ${text}`}
      className={`absolute aspect-square ${className}`}
    >
      {size > 0 && texture ? (
        <StickerDrag
          image={texture}
          imageWidth={size}
          imageHeight={size}
          /* Paper, not vinyl: no sheen, and under reduced motion no tilt
             either — 1 is the engine's floor, which is a degree nobody sees. */
          lighting={false}
          tilt={peel ? 28 : 1}
          elevation={peel ? 6 : 1}
          peel={peel}
          staticShadow={REST_SHADOW}
          dynamicShadow={peel ? DRAG_SHADOW : REST_SHADOW}
        />
      ) : null}
    </div>
  );
};
