/* Supplied Web Animation Effects source; client lifecycle owned by LibraryMotion. */
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(SplitText, ScrollTrigger);


/** @param {Document | HTMLElement} scope */
export function textReveal03(scope = document, delay = 0, { ignoreManual = false } = {}) {
  const splits = [];
  const createSplit = (...args) => { const split = SplitText.create(...args); splits.push(split); return split; };
  const CONFIG = {
    baseAlpha: 0.1,
    waveColor: "#F93600",
    duration: 0.7,
    stagger: 0.03,
    ease: "linear",
    scrollStart: "top 85%",
    scrubStart: "top 80%",
    scrubEnd: "top 20%",
    once: true,
    markers: false,
  };


  const RGB_COLOR_RE = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/;
  const RESOLVER_ATTR = "data-text-reveal-03-color-resolver";
  const root = scope.ownerDocument || document;


  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }


  function parseColorChannels(colorValue) {
    const match = colorValue.match(RGB_COLOR_RE);
    if (!match) return null;
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] === undefined ? 1 : parseFloat(match[4]),
    };
  }


  function formatColor({ r, g, b, a = 1 }) {
    const alpha = clamp01(a);
    const rounded = [Math.round(r), Math.round(g), Math.round(b)];
    return alpha < 1 ? `rgba(${rounded[0]}, ${rounded[1]}, ${rounded[2]}, ${alpha})` : `rgb(${rounded[0]}, ${rounded[1]}, ${rounded[2]})`;
  }


  function mixColorChannels(from, to, amount) {
    return {
      r: from.r + (to.r - from.r) * amount,
      g: from.g + (to.g - from.g) * amount,
      b: from.b + (to.b - from.b) * amount,
      a: from.a + (to.a - from.a) * amount,
    };
  }


  function getColorResolverEl() {
    let resolver = root.querySelector(`[${RESOLVER_ATTR}]`);
    if (!resolver) {
      resolver = root.createElement("span");
      resolver.setAttribute("aria-hidden", "true");
      resolver.setAttribute(RESOLVER_ATTR, "");
      resolver.style.position = "fixed";
      resolver.style.visibility = "hidden";
      resolver.style.pointerEvents = "none";
      resolver.style.top = "-9999px";
      resolver.style.left = "-9999px";
      resolver.style.whiteSpace = "pre";
      (root.body || root.documentElement).appendChild(resolver);
    }
    return resolver;
  }


  function resolveColorChannels(colorValue) {
    const resolver = getColorResolverEl();
    resolver.style.color = "";
    resolver.style.color = colorValue;
    if (!resolver.style.color) return null;
    return parseColorChannels(getComputedStyle(resolver).color);
  }


  const allSplitEls = scope.querySelectorAll("[data-reveal-03]");
  const autoEls = ignoreManual ? [...allSplitEls] : [...allSplitEls].filter((el) => !el.hasAttribute("data-manual"));


  gsap.set(autoEls, { visibility: "visible" });


  allSplitEls.forEach((el) => {
    if (!ignoreManual && el.hasAttribute("data-manual")) {
      createSplit(el, {
        type: "chars, words, lines",
        tag: "span",
        autoSplit: true,
        linesClass: "line",
        wordsClass: "word",
        charsClass: "char",
      });
      return;
    }


    const scrollMode = el.getAttribute("data-scroll");
    const useScroll = el.hasAttribute("data-scroll");
    const useScrub = scrollMode === "scrub";


    createSplit(el, {
      type: "chars, words, lines",
      tag: "span",
      autoSplit: true,
      linesClass: "line",
      wordsClass: "word",
      charsClass: "char",
      onSplit(instance) {
        const durationValue = parseFloat(el.dataset.duration);
        const staggerValue = parseFloat(el.dataset.stagger);
        const delayValue = parseFloat(el.dataset.delay);
        const duration = Number.isNaN(durationValue) ? CONFIG.duration : durationValue;
        const stagger = Number.isNaN(staggerValue) ? CONFIG.stagger : staggerValue;
        const elDelay = Number.isNaN(delayValue) ? 0 : delayValue;
        const ease = el.dataset.ease || CONFIG.ease;


        const targets = instance.chars;
        const once = el.hasAttribute("data-once") ? el.getAttribute("data-once") !== "false" : CONFIG.once;


        const cc = getComputedStyle(el).color;
        const finalChannels = parseColorChannels(cc);
        if (!finalChannels) return;


        const { r, g, b, a: finalAlpha } = finalChannels;
        const baseAlpha = clamp01(finalAlpha * CONFIG.baseAlpha);
        const waveChannels = resolveColorChannels(CONFIG.waveColor) || { r: 151, g: 254, b: 0, a: 1 };
        const waveColor = formatColor(waveChannels);
        const baseColor = `rgba(${r}, ${g}, ${b}, ${baseAlpha})`;
        const finalColor = formatColor(finalChannels);
        const preWaveMix = resolveColorChannels(`color-mix(in oklch, rgb(${r}, ${g}, ${b}) 22%, ${waveColor})`)
          || mixColorChannels({ r, g, b, a: 1 }, waveChannels, 0.78);
        const preWaveColor = formatColor({ ...preWaveMix, a: baseAlpha });


        const buildColorKeyframes = () => {
          const baseToTintDuration = duration * 0.12;
          const tintToWaveDuration = duration * 0.18;
          return [
            { color: preWaveColor, duration: baseToTintDuration, ease },
            { color: waveColor, duration: tintToWaveDuration, ease },
            { color: finalColor, duration: duration - baseToTintDuration - tintToWaveDuration, ease },
          ];
        };


        if (useScrub) {
          const charTweens = targets.map(() => null);
          const scrubStep = Math.max(stagger, 0);
          const totalScrubTime = elDelay + duration + Math.max(0, targets.length - 1) * scrubStep;
          let activeCount = 0;


          const getActiveCount = (playhead) => {
            if (!targets.length) return 0;
            if (scrubStep === 0) return playhead > elDelay ? targets.length : 0;
            const revealTime = playhead - elDelay;
            if (revealTime <= 0) return 0;
            return Math.min(targets.length, Math.ceil(revealTime / scrubStep));
          };


          const syncScrubChars = (playhead) => {
            const nextActiveCount = getActiveCount(playhead);
            if (nextActiveCount > activeCount) {
              for (let i = activeCount; i < nextActiveCount; i += 1) {
                charTweens[i]?.kill();
                gsap.set(targets[i], { color: baseColor });
                charTweens[i] = gsap.to(targets[i], {
                  keyframes: buildColorKeyframes(),
                  overwrite: "auto",
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
            ease: "none",
            onUpdate: () => syncScrubChars(scrubState.playhead),
            scrollTrigger: {
              trigger: el,
              start: CONFIG.scrubStart,
              end: CONFIG.scrubEnd,
              scrub: true,
              markers: CONFIG.markers,
              ...(once && { onLeave: (self) => self.kill(false) }),
            },
          });


          syncScrubChars(scrubState.playhead);
          return scrubTween;
        }


        const tween = {
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
            ...(once ? { once: true } : { toggleActions: "play none none reverse" }),
          };
        }


        gsap.set(targets, { color: baseColor });
        return gsap.to(targets, tween);
      },
    });
  });
  return () => splits.forEach(split => split.revert());
}
