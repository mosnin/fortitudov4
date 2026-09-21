/* Supplied Web Animation Effects source; client lifecycle owned by LibraryMotion. */
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(SplitText, ScrollTrigger);


/** @param {Document | HTMLElement} scope */
export function textReveal04(scope = document, delay = 0, { ignoreManual = false } = {}) {
  const splits = [];
  const createSplit = (...args) => { const split = SplitText.create(...args); splits.push(split); return split; };
  const stripColor = "#6200e1";
  const duration = 0.6;
  const stagger = 0.1;
  const scaleStart = -0.2;
  const ease = "power3.out";
  const scrollStart = "top 85%";
  const scrubStart = "top 95%";
  const scrubEnd = "top 5%";
  const once = true;
  const markers = false;


  const dir = {
    ltr: { clipFrom: "inset(0% 100% 0% 0%)", scale: "scaleX", origin: "right" },
    rtl: { clipFrom: "inset(0% 0% 0% 100%)", scale: "scaleX", origin: "left" },
    ttb: { clipFrom: "inset(0% 0% 100% 0%)", scale: "scaleY", origin: "bottom" },
    btt: { clipFrom: "inset(100% 0% 0% 0%)", scale: "scaleY", origin: "top" },
  };


  const allEls = scope.querySelectorAll("[data-reveal-04]");
  const autoEls = ignoreManual ? [...allEls] : [...allEls].filter((el) => !el.hasAttribute("data-manual"));


  gsap.set(autoEls, { visibility: "visible" });


  allEls.forEach((el) => {
    if (!ignoreManual && el.hasAttribute("data-manual")) {
      createSplit(el, {
        type: "lines",
        linesClass: "line",
        autoSplit: true,
      });
      return;
    }


    const scrollMode = el.getAttribute("data-scroll");
    const useScroll = el.hasAttribute("data-scroll");
    const useScrub = scrollMode === "scrub";


    createSplit(el, {
      type: "lines",
      linesClass: "line",
      autoSplit: true,
      onSplit(instance) {
        const color = el.dataset.stripColor || stripColor;
        const align = getComputedStyle(el).textAlign;
        const d = dir[el.getAttribute("data-reveal-04")] || dir.ltr;


        const durationVal = parseFloat(el.dataset.duration);
        const staggerVal = parseFloat(el.dataset.stagger);
        const delayVal = parseFloat(el.dataset.delay);
        const dur = Number.isNaN(durationVal) ? duration : durationVal;
        const stag = Number.isNaN(staggerVal) ? stagger : staggerVal;
        const elDelay = Number.isNaN(delayVal) ? 0 : delayVal;
        const ez = el.dataset.ease || ease;
        const elOnce = el.hasAttribute("data-once") ? el.getAttribute("data-once") !== "false" : once;
        const descender =
          getComputedStyle(el).getPropertyValue("--reveal-descender").trim() || "0.18em";
        const clipMargin =
          getComputedStyle(el).getPropertyValue("--reveal-clip-margin").trim() || "0.06em";
        const bleed = `calc(${descender} + ${clipMargin})`;


        const strips = [];


        instance.lines.forEach((line) => {
          const lineStyle = {
            position: "relative",
            width: "fit-content",
            paddingBottom: bleed,
            marginBottom: `calc(-1 * (${descender} + ${clipMargin}))`,
            clipPath: d.clipFrom,
          };
          if (align === "center") lineStyle.marginInline = "auto";
          else if (align === "right" || align === "end") lineStyle.marginLeft = "auto";
          gsap.set(line, lineStyle);


          const strip = document.createElement("div");
          gsap.set(strip, {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: color,
            pointerEvents: "none",
            transformOrigin: d.origin,
          });
          line.appendChild(strip);
          strips.push({ line, strip });
        });


        const tl = gsap.timeline({ paused: true });
        strips.forEach(({ line, strip }, i) => {
          const offset = i * stag;
          tl.to(line, { clipPath: "inset(0% 0% 0% 0%)", duration: dur, ease: ez }, offset)
            .to(strip, { [d.scale]: 0, duration: dur, ease: ez }, offset + dur + scaleStart);
        });


        if (useScrub) {
          tl.scrollTrigger = ScrollTrigger.create({
            trigger: el,
            start: scrubStart,
            end: scrubEnd,
            scrub: true,
            markers,
            animation: tl,
            ...(elOnce && { onLeave: (self) => self.kill(false) }),
          });
        } else if (useScroll) {
          const start = scrollMode || scrollStart;
          tl.scrollTrigger = ScrollTrigger.create({
            trigger: el,
            start: `clamp(${start})`,
            markers,
            animation: tl,
            ...(elOnce ? { once: true } : { toggleActions: "play none none reverse" }),
          });
        } else {
          tl.delay(elDelay + delay).play();
        }


        return tl;
      },
    });
  });
  return () => splits.forEach(split => split.revert());
}
