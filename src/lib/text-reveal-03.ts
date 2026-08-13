/* eslint-disable @typescript-eslint/no-explicit-any --
   vendored per-spec: the resource contract forbids paraphrasing the core
   algorithm, and its DOM/GSAP plumbing is stringly-typed by nature. */

/**
 * Text Reveal 03 — a GSAP character colour-wave reveal, ported from the
 * resource spec supplied in-conversation. Elements opt in with
 * `data-reveal-03`; SplitText breaks them into `.char` spans and each
 * character sweeps baseColor (dimmed) → preWaveColor → waveColor → its own
 * computed colour. `data-scroll` triggers on entry, `data-scroll="scrub"`
 * activates characters one by one as the page scrolls.
 *
 * KEPT PER THE SPEC (its "do not paraphrase" list): the colour helpers, the
 * hidden resolver span, `buildColorKeyframes` with its 12%/18% phase split,
 * the `color-mix(in oklch, …)` attempt with channel-mix fallback, the whole
 * scrub playhead machine, and `clamp(${start})` scroll starts.
 *
 * ADAPTED FOR THIS SITE, outside the core algorithm:
 *  - `CONFIG.waveColor` is the racing yellow — the only accent this surface
 *    owns. The spec lists waveColor as a customization point.
 *  - The hidden state is armed by `html[data-tr03]` (set by an inline script
 *    before hydration, and only when the visitor has NOT asked for reduced
 *    motion) — see `text-reveal-init.tsx`. Without JS, or under the
 *    preference, nothing is ever hidden or dimmed: this site has already
 *    shipped one invisible-text bug and does not ship another.
 *  - Reduced motion never reaches this module at all; the init component
 *    simply does not call it.
 *
 * SplitText mutates the DOM after hydration. That is safe here because every
 * opted-in element renders static dictionary text that never re-renders; do
 * NOT put `data-reveal-03` on text React re-renders, or reconciliation will
 * fight the split spans.
 */

import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText, ScrollTrigger);

export function textReveal03(
  scope: Document | Element = document,
  delay = 0,
  { ignoreManual = false } = {},
) {
  const CONFIG = {
    baseAlpha: 0.1,
    waveColor: '#f8cd02', // --fx-yellow; the spec default was orange
    duration: 0.7,
    stagger: 0.03,
    ease: 'linear',
    scrollStart: 'top 85%',
    scrubStart: 'top 80%',
    scrubEnd: 'top 20%',
    once: true,
    markers: false,
  };

  const RGB_COLOR_RE = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;
  const RESOLVER_ATTR = 'data-text-reveal-03-color-resolver';
  const root: Document = (scope as Element).ownerDocument || (scope as Document);

  function clamp01(value: number) {
    return Math.max(0, Math.min(1, value));
  }

  function parseColorChannels(colorValue: string) {
    const match = colorValue.match(RGB_COLOR_RE);
    if (!match) return null;
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] === undefined ? 1 : parseFloat(match[4]),
    };
  }

  function formatColor({ r, g, b, a = 1 }: { r: number; g: number; b: number; a?: number }) {
    const alpha = clamp01(a);
    const rounded = [Math.round(r), Math.round(g), Math.round(b)];
    return alpha < 1
      ? `rgba(${rounded[0]}, ${rounded[1]}, ${rounded[2]}, ${alpha})`
      : `rgb(${rounded[0]}, ${rounded[1]}, ${rounded[2]})`;
  }

  function mixColorChannels(from: any, to: any, amount: number) {
    return {
      r: from.r + (to.r - from.r) * amount,
      g: from.g + (to.g - from.g) * amount,
      b: from.b + (to.b - from.b) * amount,
      a: from.a + (to.a - from.a) * amount,
    };
  }

  function getColorResolverEl() {
    let resolver = root.querySelector(`[${RESOLVER_ATTR}]`) as HTMLElement | null;
    if (!resolver) {
      resolver = root.createElement('span');
      resolver.setAttribute('aria-hidden', 'true');
      resolver.setAttribute(RESOLVER_ATTR, '');
      resolver.style.position = 'fixed';
      resolver.style.visibility = 'hidden';
      resolver.style.pointerEvents = 'none';
      resolver.style.top = '-9999px';
      resolver.style.left = '-9999px';
      resolver.style.whiteSpace = 'pre';
      (root.body || root.documentElement).appendChild(resolver);
    }
    return resolver;
  }

  function resolveColorChannels(colorValue: string) {
    const resolver = getColorResolverEl();
    resolver.style.color = '';
    resolver.style.color = colorValue;
    if (!resolver.style.color) return null;
    return parseColorChannels(getComputedStyle(resolver).color);
  }

  const allSplitEls = (scope as Element | Document).querySelectorAll('[data-reveal-03]');
  const autoEls = ignoreManual
    ? [...allSplitEls]
    : [...allSplitEls].filter((el) => !el.hasAttribute('data-manual'));

  gsap.set(autoEls, { visibility: 'visible' });

  allSplitEls.forEach((el) => {
    if (!ignoreManual && el.hasAttribute('data-manual')) {
      SplitText.create(el, {
        type: 'chars, words, lines',
        tag: 'span',
        autoSplit: true,
        linesClass: 'line',
        wordsClass: 'word',
        charsClass: 'char',
      });
      return;
    }

    const scrollMode = el.getAttribute('data-scroll');
    const useScroll = el.hasAttribute('data-scroll');
    const useScrub = scrollMode === 'scrub';

    SplitText.create(el, {
      type: 'chars, words, lines',
      tag: 'span',
      autoSplit: true,
      linesClass: 'line',
      wordsClass: 'word',
      charsClass: 'char',
      onSplit(instance: any) {
        const element = el as HTMLElement;
        const durationValue = parseFloat(element.dataset.duration ?? '');
        const staggerValue = parseFloat(element.dataset.stagger ?? '');
        const delayValue = parseFloat(element.dataset.delay ?? '');
        const duration = Number.isNaN(durationValue) ? CONFIG.duration : durationValue;
        const stagger = Number.isNaN(staggerValue) ? CONFIG.stagger : staggerValue;
        const elDelay = Number.isNaN(delayValue) ? 0 : delayValue;
        const ease = element.dataset.ease || CONFIG.ease;

        const targets = instance.chars;
        const once = el.hasAttribute('data-once')
          ? el.getAttribute('data-once') !== 'false'
          : CONFIG.once;

        const cc = getComputedStyle(el).color;
        const finalChannels = parseColorChannels(cc);
        if (!finalChannels) return;

        const { r, g, b, a: finalAlpha } = finalChannels;
        const baseAlpha = clamp01(finalAlpha * CONFIG.baseAlpha);
        const waveChannels = resolveColorChannels(CONFIG.waveColor) || {
          r: 151,
          g: 254,
          b: 0,
          a: 1,
        };
        const waveColor = formatColor(waveChannels);
        const baseColor = `rgba(${r}, ${g}, ${b}, ${baseAlpha})`;
        const finalColor = formatColor(finalChannels);
        const preWaveMix =
          resolveColorChannels(
            `color-mix(in oklch, rgb(${r}, ${g}, ${b}) 22%, ${waveColor})`,
          ) || mixColorChannels({ r, g, b, a: 1 }, waveChannels, 0.78);
        const preWaveColor = formatColor({ ...preWaveMix, a: baseAlpha });

        const buildColorKeyframes = () => {
          const baseToTintDuration = duration * 0.12;
          const tintToWaveDuration = duration * 0.18;
          return [
            { color: preWaveColor, duration: baseToTintDuration, ease },
            { color: waveColor, duration: tintToWaveDuration, ease },
            {
              color: finalColor,
              duration: duration - baseToTintDuration - tintToWaveDuration,
              ease,
            },
          ];
        };

        if (useScrub) {
          const charTweens: any[] = targets.map(() => null);
          const scrubStep = Math.max(stagger, 0);
          const totalScrubTime =
            elDelay + duration + Math.max(0, targets.length - 1) * scrubStep;
          let activeCount = 0;

          const getActiveCount = (playhead: number) => {
            if (!targets.length) return 0;
            if (scrubStep === 0) return playhead > elDelay ? targets.length : 0;
            const revealTime = playhead - elDelay;
            if (revealTime <= 0) return 0;
            return Math.min(targets.length, Math.ceil(revealTime / scrubStep));
          };

          const syncScrubChars = (playhead: number) => {
            const nextActiveCount = getActiveCount(playhead);
            if (nextActiveCount > activeCount) {
              for (let i = activeCount; i < nextActiveCount; i += 1) {
                charTweens[i]?.kill();
                gsap.set(targets[i], { color: baseColor });
                charTweens[i] = gsap.to(targets[i], {
                  keyframes: buildColorKeyframes(),
                  overwrite: 'auto',
                });
              }
            } else if (nextActiveCount < activeCount) {
              for (let i = nextActiveCount; i < activeCount; i += 1) {
                charTweens[i]?.kill();
                charTweens[i] = null;
                gsap.set(targets[i], { color: baseColor });
              }
            }
            activeCount = nextActiveCount;
          };

          gsap.set(targets, { color: baseColor });

          const scrubState = { playhead: 0 };
          const scrubTween = gsap.to(scrubState, {
            playhead: totalScrubTime,
            duration: 1,
            ease: 'none',
            onUpdate: () => syncScrubChars(scrubState.playhead),
            scrollTrigger: {
              trigger: el,
              start: CONFIG.scrubStart,
              end: CONFIG.scrubEnd,
              scrub: true,
              markers: CONFIG.markers,
              ...(once && { onLeave: (self: any) => self.kill(false) }),
            },
          });

          syncScrubChars(scrubState.playhead);
          return scrubTween;
        }

        const tween: any = {
          keyframes: buildColorKeyframes(),
          stagger,
          delay: useScroll ? elDelay : elDelay + delay,
        };

        if (useScroll) {
          const start = scrollMode || CONFIG.scrollStart;
          tween.scrollTrigger = {
            trigger: el,
            start: `clamp(${start})`,
            markers: CONFIG.markers,
            ...(once ? { once: true } : { toggleActions: 'play none none reverse' }),
          };
        }

        gsap.set(targets, { color: baseColor });
        return gsap.to(targets, tween);
      },
    });
  });
}
