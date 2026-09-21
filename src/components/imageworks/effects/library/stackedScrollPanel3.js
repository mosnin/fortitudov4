/* Supplied Web Animation Effects source; client lifecycle owned by LibraryMotion. */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
gsap.registerPlugin(ScrollTrigger, CustomEase);


/** @param {Document | HTMLElement} scope */
function stackedScrollPanel3(scope = document, options = {}) {
  // Motion defaults. The timeline is scrubbed by the scroll position, so its
  // durations are shares of the runway rather than seconds. Every `ease` is a
  // cubic-bezier curve, the same four numbers CSS uses.
  const inOutQuad = [0.455, 0.03, 0.515, 0.955]; // ease-in-out-quad


  const defaults = {
    scroll: {
      perCard: 100, // viewport heights of runway per card
      scrub: 0.5, // seconds the stack takes to catch up with the wheel; 0 ties it directly
      overlap: 0.22, // how far into the previous exit the next one starts, as a share of one step
      stagger: 0.012, // extra delay per card behind before it steps forward
      ease: inOutQuad,
    },
    // Where the cards behind the front one rest: each sits a little lower and deeper.
    stack: {
      perspective: 21, // % of the viewport width
      offset: 9.5, // % of the card height per card behind
      depth: -32, // px of z per card behind
    },
    // The front card leaving.
    exit: {
      lift: -100, // % of the viewport height
      tilt: 14, // deg around the x axis
    },
    // Its title and content fold a little further than the card itself.
    title: { shift: -96, tilt: 38 }, // px, deg
    content: { shift: -48, tilt: 38 },
    mobile: {
      maxWidth: 767, // px; at or below this the stack pins near the top instead of the centre
      pinOffset: 84, // px from the top of the viewport
      perspective: 104, // px
    },
  };


  const curves = new Map();


  // Turns a cubic-bezier curve into a GSAP ease. Anything else (a spring, for
  // instance) falls back to the resource default.
  function curve(ease) {
    const source = Array.isArray(ease) && ease.length === 4 ? ease : defaults.scroll.ease;
    const key = source.join(",");
    if (!curves.has(key)) curves.set(key, CustomEase.create(`stacked-scroll-panel-3-${curves.size}`, key));
    return curves.get(key);
  }


  function merge(target, source) {
    const nested = (value) => value && typeof value === "object" && !Array.isArray(value);
    Object.entries(source ?? {}).forEach(([key, value]) => {
      target[key] = nested(value) && nested(target[key]) ? merge(target[key], value) : value;
    });
    return target;
  }


  const root = scope.querySelector("[data-stacked-scroll-panel-3]");
  if (!root) return;
  root.stackCleanup?.();


  const settings = merge(structuredClone(defaults), options);
  const runway = root.querySelector("[data-card-runway]");
  const stack = root.querySelector("[data-card-stack]");
  const cards = [...root.querySelectorAll("[data-card]")];
  if (!runway || !stack || cards.length === 0) return;


  let context;
  let timeline;
  let resizeFrame;
  let width = window.innerWidth;
  let height = window.innerHeight;


  const mobile = () => window.innerWidth <= settings.mobile.maxWidth;
  const perspective = () =>
    mobile() ? settings.mobile.perspective : (settings.stack.perspective / 100) * window.innerWidth;
  // Where the stack pins: centred in the viewport, or a fixed distance from the top on small screens.
  const pinOffset = () =>
    mobile() ? settings.mobile.pinOffset : Math.max(0, (window.innerHeight - stack.offsetHeight) / 2);
  const runwayHeight = () => cards.length * (settings.scroll.perCard / 100) * window.innerHeight;
  // Resting place of a card with `slot` cards in front of it.
  const restPose = (slot) => ({
    yPercent: settings.stack.offset * slot,
    z: settings.stack.depth * slot,
  });


  function build() {
    context?.revert();
    const ease = curve(settings.scroll.ease);


    context = gsap.context(() => {
      root.style.setProperty("--pin-offset", `${Math.round(pinOffset())}px`);
      runway.style.height = `${Math.round(runwayHeight())}px`;
      stack.style.perspective = `${Math.round(perspective())}px`;
      cards.forEach((card, index) => {
        gsap.set(card, { zIndex: cards.length - index, ...restPose(index) });
      });


      timeline = gsap.timeline({
        defaults: { duration: 1, ease },
        scrollTrigger: {
          trigger: runway,
          start: () => `top top+=${Math.round(pinOffset())}`,
          end: "bottom top",
          pin: stack,
          pinSpacing: false,
          scrub: settings.scroll.scrub > 0 ? settings.scroll.scrub : true,
          invalidateOnRefresh: true,
        },
      });


      cards.forEach((card, index) => {
        // The front card lifts out of the viewport and tilts away.
        timeline.to(
          card,
          {
            y: () => (settings.exit.lift / 100) * window.innerHeight,
            rotationX: settings.exit.tilt,
          },
          index > 0 ? `-=${settings.scroll.overlap}` : 0,
        );
        const start = timeline.recent().startTime();


        // Its title and content fold a little further than the card.
        timeline.to(
          card.querySelectorAll("[data-card-title]"),
          { y: settings.title.shift, rotationX: settings.title.tilt },
          start,
        );
        timeline.to(
          card.querySelectorAll("[data-card-content]"),
          { y: settings.content.shift, rotationX: settings.content.tilt },
          start,
        );


        // Every card behind it steps forward one place.
        for (let behind = index + 1; behind < cards.length; behind += 1) {
          timeline.to(
            cards[behind],
            restPose(behind - index - 1),
            start + settings.scroll.stagger * (behind - index),
          );
        }
      });
    }, root);


    ScrollTrigger.refresh();
  }


  // Rebuilds in place; the scroll position keeps the stack where it was.
  function update(next) {
    merge(settings, next);
    build();
  }


  function onResize() {
    if (width === window.innerWidth && height === window.innerHeight) return;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      width = window.innerWidth;
      height = window.innerHeight;
      build();
    });
  }


  build();
  window.addEventListener("resize", onResize);


  function destroy() {
    window.removeEventListener("resize", onResize);
    cancelAnimationFrame(resizeFrame);
    context.revert();
    root.style.removeProperty("--pin-offset");
    runway.style.height = "";
    stack.style.perspective = "";
    delete root.stackCleanup;
  }
  root.stackCleanup = destroy;
  return { root, update, destroy };
}



export { stackedScrollPanel3 };
