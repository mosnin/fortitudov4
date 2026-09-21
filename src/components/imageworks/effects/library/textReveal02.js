/* Supplied Web Animation Effects source; client lifecycle owned by LibraryMotion. */
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(SplitText, ScrollTrigger);


/** @param {Document | HTMLElement} scope */
export function textReveal02(scope = document, delay = 0, { ignoreManual = false } = {}) {
  const splits = [];
  const createSplit = (...args) => { const split = SplitText.create(...args); splits.push(split); return split; };
  const CONFIG = {
    lines: { duration: 0.04, stagger: 0.03, ease: "power1.out" },
    words: { duration: 0.04, stagger: 0.03, ease: "power1.out" },
    chars: { duration: 0.04, stagger: 0.03, ease: "power1.out" },
    scrollStart: "top 85%",
    scrubStart: "top 80%",
    scrubEnd: "top 20%",
    once: true,
    markers: false,
  };


  const allSplitEls = scope.querySelectorAll("[data-reveal-02]");
  const autoEls = ignoreManual
    ? [...allSplitEls]
    : [...allSplitEls].filter((el) => !el.hasAttribute("data-manual"));


  gsap.set(autoEls, { visibility: "visible" });


  allSplitEls.forEach((el) => {
    const splitType = el.getAttribute("data-reveal-02");
    const c = CONFIG[splitType];
    if (!c) return;


    let type, linesClass, wordsClass, charsClass;
    switch (splitType) {
      case "lines":
        type = "lines";
        linesClass = "line";
        break;
      case "words":
        type = "words, lines";
        wordsClass = "word";
        linesClass = "line";
        break;
      case "chars":
        type = "chars, words, lines";
        charsClass = "char";
        wordsClass = "word";
        linesClass = "line";
        break;
      default:
        return;
    }


    if (!ignoreManual && el.hasAttribute("data-manual")) {
      createSplit(el, {
        type,
        autoSplit: true,
        ...(linesClass && { linesClass }),
        ...(wordsClass && { wordsClass }),
        ...(charsClass && { charsClass }),
      });
      return;
    }


    const scrollMode = el.getAttribute("data-scroll");
    const useScroll = el.hasAttribute("data-scroll");
    const useScrub = scrollMode === "scrub";


    createSplit(el, {
      type,
      autoSplit: true,
      ...(linesClass && { linesClass }),
      ...(wordsClass && { wordsClass }),
      ...(charsClass && { charsClass }),
      onSplit(instance) {
        const durationValue = parseFloat(el.dataset.duration);
        const staggerValue = parseFloat(el.dataset.stagger);
        const delayValue = parseFloat(el.dataset.delay);
        const duration = Number.isNaN(durationValue) ? c.duration : durationValue;
        const stagger = Number.isNaN(staggerValue) ? c.stagger : staggerValue;
        const elDelay = Number.isNaN(delayValue) ? 0 : delayValue;
        const ease = el.dataset.ease || c.ease;


        const targets = instance[splitType];
        const once = el.hasAttribute("data-once")
          ? el.getAttribute("data-once") !== "false"
          : CONFIG.once;


        const tween = {
          opacity: 0.1,
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
            ...(once && { onLeave: (self) => self.kill(false) }),
          };
        } else if (useScroll) {
          const start = scrollMode || CONFIG.scrollStart;
          tween.scrollTrigger = {
            trigger: el,
            start: `clamp(${start})`,
            markers: CONFIG.markers,
            ...(once ? { once: true } : { toggleActions: "play none none reverse" }),
          };
        }


        return gsap.from(targets, tween);
      },
    });
  });
  return () => splits.forEach(split => split.revert());
}
