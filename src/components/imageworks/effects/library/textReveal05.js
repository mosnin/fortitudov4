/* Supplied Web Animation Effects source; client lifecycle owned by LibraryMotion. */
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";


gsap.registerPlugin(SplitText, ScrollTrigger);


function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


/** @param {Document | HTMLElement} scope */
export function textReveal05(scope = document, delay = 0, { ignoreManual = false } = {}) {
  const splits = [];
  const createSplit = (...args) => { const split = SplitText.create(...args); splits.push(split); return split; };
  const CONFIG = {
    duration: 0.6,
    shuffles: 8,
    scrollStart: "top 85%",
    scrubStart: "top 90%",
    scrubEnd: "top 50%",
    once: false,
    markers: false,
  };


  const allEls = scope.querySelectorAll("[data-reveal-05]");
  const autoEls = ignoreManual ? [...allEls] : [...allEls].filter((el) => !el.hasAttribute("data-manual"));


  gsap.set(autoEls, { visibility: "visible" });


  allEls.forEach((el) => {
    if (!ignoreManual && el.hasAttribute("data-manual")) {
      createSplit(el, { type: "chars, words", charsClass: "char", wordsClass: "word", autoSplit: true });
      return;
    }


    const scrollMode = el.getAttribute("data-scroll");
    const useScroll = el.hasAttribute("data-scroll");
    const useScrub = scrollMode === "scrub";


    createSplit(el, {
      type: "chars, words",
      charsClass: "char",
      wordsClass: "word",
      autoSplit: true,
      onSplit(instance) {
        const durationVal = parseFloat(el.dataset.duration);
        const delayVal = parseFloat(el.dataset.delay);
        const shufflesVal = parseInt(el.dataset.shuffles, 10);


        const duration = Number.isNaN(durationVal) ? CONFIG.duration : durationVal;
        const elDelay = Number.isNaN(delayVal) ? 0 : delayVal;
        const shuffles = Number.isNaN(shufflesVal) ? CONFIG.shuffles : shufflesVal;
        const once = el.hasAttribute("data-once") ? el.getAttribute("data-once") !== "false" : CONFIG.once;
        const totalSteps = shuffles + 1;


        const wordData = instance.words.map((wordEl) => {
          const charEls = [...wordEl.querySelectorAll(".char")];
          const originals = charEls.map((c) => c.textContent);
          const states = [];
          for (let s = 0; s < shuffles; s++) {
            states.push(shuffleArray([...originals]));
          }
          states.push([...originals]);
          return { charEls, states };
        });


        wordData.forEach(({ charEls, states }) => {
          charEls.forEach((c, i) => (c.textContent = states[0][i]));
        });


        const proxy = { progress: 0 };
        let lastStep = 0;


        function applyStep(step) {
          if (step === lastStep) return;
          lastStep = step;
          wordData.forEach(({ charEls, states }) => {
            charEls.forEach((c, i) => (c.textContent = states[step][i]));
          });
        }


        const tweenVars = {
          progress: 1,
          duration,
          ease: "none",
          delay: useScroll ? elDelay : elDelay + delay,
          onUpdate() {
            applyStep(Math.min(Math.floor(proxy.progress * totalSteps), totalSteps - 1));
          },
          onComplete() {
            applyStep(totalSteps - 1);
          },
        };


        if (useScrub) {
          tweenVars.scrollTrigger = {
            trigger: el,
            start: CONFIG.scrubStart,
            end: CONFIG.scrubEnd,
            scrub: true,
            markers: CONFIG.markers,
            ...(once && { onLeave: (self) => self.kill(false) }),
          };
        } else if (useScroll) {
          const start = scrollMode || CONFIG.scrollStart;
          tweenVars.scrollTrigger = {
            trigger: el,
            start: `clamp(${start})`,
            markers: CONFIG.markers,
            ...(once ? { once: true } : { toggleActions: "play none none reverse" }),
          };
        }


        return gsap.to(proxy, tweenVars);
      },
    });
  });
  return () => splits.forEach(split => split.revert());
}
