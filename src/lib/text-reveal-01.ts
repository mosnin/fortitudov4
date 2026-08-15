/* eslint-disable @typescript-eslint/no-explicit-any --
   vendored per-spec: the hero-01 resource ships this helper as-is and its
   GSAP/SplitText plumbing is stringly-typed by nature. */

/**
 * Text Reveal 01 — the masked line/word/char slide-up reveal that ships with
 * the Hero 01 resource, ported near-verbatim. Elements opt in with
 * `data-reveal-01="lines|words|chars"`; SplitText masks each unit and GSAP
 * slides it up from `yPercent: 110`. `CONFIG.once` defaults to **false** and
 * the hero passes a load delay of **2.24s**, both by the resource's explicit
 * instruction, so the copy arrives after the media expansion finishes.
 *
 * The hidden state (`[data-reveal-01] { visibility: hidden }`) is gated on
 * `html[data-hero01]`, armed by an inline pre-hydration script in the hero —
 * and never armed under prefers-reduced-motion or without JS, the same
 * no-invisible-text rule Text Reveal 03 follows. The mask CSS (part B of the
 * resource) lives in globals.css.
 */

import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText, ScrollTrigger);

export function textReveal01(
  scope: Document | Element = document,
  delay = 0,
  { ignoreManual = false } = {},
) {
  const CONFIG = {
    lines: { duration: 1, stagger: 0.06, ease: 'expo.out' },
    words: { duration: 1, stagger: 0.03, ease: 'expo.out' },
    chars: { duration: 0.6, stagger: 0.01, ease: 'expo.out' },
    scrollStart: 'top 72%',
    scrubStart: 'top 80%',
    scrubEnd: 'top 20%',
    once: false,
    markers: false,
  } as const;

  const allSplitEls = scope.querySelectorAll('[data-reveal-01]');
  const autoEls = ignoreManual
    ? [...allSplitEls]
    : [...allSplitEls].filter((el) => !el.hasAttribute('data-manual'));

  gsap.set(autoEls, { visibility: 'visible' });

  allSplitEls.forEach((el) => {
    const splitType = el.getAttribute('data-reveal-01') as 'lines' | 'words' | 'chars' | null;
    const c = splitType ? CONFIG[splitType] : undefined;
    if (!c) return;

    let type: string;
    let mask: string;
    let linesClass: string | undefined;
    let wordsClass: string | undefined;
    let charsClass: string | undefined;

    switch (splitType) {
      case 'lines':
        type = 'lines';
        mask = 'lines';
        linesClass = 'line';
        break;
      case 'words':
        type = 'words, lines';
        mask = 'words';
        wordsClass = 'word';
        linesClass = 'line';
        break;
      case 'chars':
        type = 'chars, words, lines';
        mask = 'chars';
        charsClass = 'char';
        wordsClass = 'word';
        linesClass = 'line';
        break;
      default:
        return;
    }

    if (!ignoreManual && el.hasAttribute('data-manual')) {
      SplitText.create(el, {
        type,
        mask,
        autoSplit: true,
        ...(linesClass && { linesClass }),
        ...(wordsClass && { wordsClass }),
        ...(charsClass && { charsClass }),
      } as any);
      return;
    }

    const scrollMode = el.getAttribute('data-scroll');
    const useScroll = el.hasAttribute('data-scroll');
    const useScrub = scrollMode === 'scrub';

    SplitText.create(el, {
      type,
      mask,
      autoSplit: true,
      ...(linesClass && { linesClass }),
      ...(wordsClass && { wordsClass }),
      ...(charsClass && { charsClass }),
      onSplit(instance: any) {
        const element = el as HTMLElement;
        const durationValue = parseFloat(element.dataset.duration ?? '');
        const staggerValue = parseFloat(element.dataset.stagger ?? '');
        const delayValue = parseFloat(element.dataset.delay ?? '');
        const duration = Number.isNaN(durationValue) ? c.duration : durationValue;
        const stagger = Number.isNaN(staggerValue) ? c.stagger : staggerValue;
        const elDelay = Number.isNaN(delayValue) ? 0 : delayValue;
        const ease = element.dataset.ease || c.ease;

        const targets = instance[splitType as 'lines' | 'words' | 'chars'];
        const once = el.hasAttribute('data-once')
          ? el.getAttribute('data-once') !== 'false'
          : CONFIG.once;

        const tween: any = {
          yPercent: 110,
          duration,
          stagger,
          delay: useScroll ? elDelay : elDelay + delay,
          immediateRender: true,
          ease,
        };

        if (useScrub) {
          tween.scrollTrigger = {
            trigger: el,
            start: CONFIG.scrubStart,
            end: CONFIG.scrubEnd,
            scrub: true,
            markers: CONFIG.markers,
            ...(once && { onLeave: (self: any) => self.kill(false) }),
          };
        } else if (useScroll) {
          const start = scrollMode || CONFIG.scrollStart;
          tween.scrollTrigger = {
            trigger: el,
            start: `clamp(${start})`,
            markers: CONFIG.markers,
            ...(once ? { once: true } : { toggleActions: 'play none none reverse' }),
          };
        }

        return gsap.from(targets, tween);
      },
    } as any);
  });
}
