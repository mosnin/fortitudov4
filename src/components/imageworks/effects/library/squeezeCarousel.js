// Canonical source: Web Animation Effects, entry 00. Only module export and React lifecycle boundary adapted.
// NPM only. CDN users: ignore this block.
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);


// Turns a CSS linear() stop list into a GSAP ease, so the same curve can be
// shared with CSS transitions. Stops are "value" or "value position%".
function linearEase(stops) {
  const points = stops.split(",").map((stop) => {
    const [value, position] = stop.trim().split(/\s+/);
    return { value: Number(value), position: position ? Number(position.replace("%", "")) / 100 : null };
  });
  points[0].position ??= 0;
  points[points.length - 1].position ??= 1;
  points.forEach((point, i) => {
    if (point.position !== null) return;
    let end = i;
    while (points[end].position === null) end += 1;
    const start = points[i - 1].position;
    point.position = start + (points[end].position - start) / (end - i + 1);
  });
  return (t) => {
    if (t <= 0) return points[0].value;
    if (t >= 1) return points[points.length - 1].value;
    const next = points.findIndex((point) => point.position >= t);
    const a = points[next - 1];
    const b = points[next];
    return a.value + ((t - a.position) / (b.position - a.position)) * (b.value - a.value);
  };
}


// A quick settle with a long tail, the same curve as the ease-dropdown token.
const settle = linearEase(
  "0, 0.005, 0.02 2.1%, 0.081 4.7%, 0.467 15.7%, 0.563, 0.645, 0.717, 0.778 28.5%, 0.829 32%, 0.872 35.8%, 0.909 40.1%, 0.938 44.9%, 0.961 50.3%, 0.977 56.5%, 0.987 63.6%, 0.994 72.3%, 1",
);


// Motion defaults. Durations and delays are seconds; `ease` accepts a GSAP
// ease name or a function like the one above.
const motion = {
  // The cards resizing and sliding when you navigate or hover.
  cards: { duration: 0.96, ease: settle },
  // The caption lines leaving upward and the next ones rising in.
  text: { duration: 1.2, ease: settle, delay: 0.25, stagger: 0.05, travel: 110 },
};


// The strip's geometry. The featured card is the strip height times
// `featuredRatio`; what is left after gaps and slivers is split by `shares`.
const layout = {
  stripRatio: 2.678, // strip width / height
  featuredRatio: 16 / 9,
  gap: 16, // between the featured card and the three previews
  sliverGap: 8, // between the narrow slivers at the end
  sliverWidth: 8,
  shares: [-0.06, 0.61, 0.3, 0.15], // featured trim, preview 1, 2, 3
  hoverGain: [0, 0.1, 0.1, 0.1], // extra share for the hovered preview
  hoverSqueeze: [0.06, 0.02, 0.02, 0.02], // taken from every other column
  sliverHover: 3, // px a hovered sliver grows
};




/** @param {Document | HTMLElement} scope */
export function squeezeCarousel(scope = document) {
  scope.querySelectorAll("[data-morphing-carousel-2]").forEach((root) => {
    root.squeezeCleanup?.();


    const strip = root.querySelector("[data-strip]");
    const templates = [...root.querySelectorAll("[data-item]")];
    const captions = [...root.querySelectorAll("[data-caption]")];
    const previousButton = root.querySelector("[data-previous]");
    const nextButton = root.querySelector("[data-next]");
    if (!strip || templates.length < 5 || !previousButton || !nextButton) return;


    const count = templates.length;
    const sliverCount = Math.max(1, Math.min(3, count - 4));
    const visibleCount = 4 + sliverCount;
    const events = new AbortController();
    const shifts = templates.map((t) => Number(t.dataset.shift) || 0);


    let width = 0;
    let height = 0;
    let featuredWidth = 0; // base width of the featured card
    let pool = 0; // width shared by the previews
    let mediaWidth = 0; // every media element is this wide
    let cards = [];
    let shares = [...layout.shares];
    let hovered = -1;
    let columnOffset = 0;
    let trackX = 0;
    let sliverGrow = 0;
    let stripTween = null;
    let textTween = null;
    let split = [];
    let active = 0;
    let destroyed = false;


    const cycle = (index) => ((index % count) + count) % count;
    const totalGap = () => layout.gap * 3 + layout.sliverGap * sliverCount;


    // ---- cards ------------------------------------------------------------


    function makeCard(item, column) {
      const element = document.createElement("div");
      element.className = "card";
      element.append(templates[item].content.cloneNode(true));
      const media = element.querySelector(".media") || element.firstElementChild;
      media.style.width = `${mediaWidth}px`;
      strip.append(element);
      return {
        item, element, media, column,
        x: 0,
        width: layout.sliverWidth,
        leftGap: column < 4 ? layout.gap : layout.sliverGap,
        shift: column === 0 ? 0 : shifts[item],
      };
    }


    function cardWidth(column) {
      if (column < 0 || column > 3) return layout.sliverWidth + (hovered === column ? sliverGrowTarget() : 0);
      const available = pool - sliverGrowTarget();
      if (column === 0) return featuredWidth + available * shares[0];
      return available * shares[column];
    }


    function sliverGrowTarget() {
      return hovered > 3 ? layout.sliverHover : 0;
    }


    function measure() {
      width = strip.getBoundingClientRect().width;
      height = width / layout.stripRatio;
      strip.style.height = `${height}px`;
      featuredWidth = height * layout.featuredRatio;
      pool = width - featuredWidth - totalGap() - layout.sliverWidth * sliverCount;
      mediaWidth = featuredWidth + pool * (layout.shares[0] + layout.hoverGain[0]);
      for (const card of cards) {
        card.width = cardWidth(card.column);
        card.leftGap = card.column < 4 ? layout.gap : layout.sliverGap;
        card.media.style.width = `${mediaWidth}px`;
      }
      hovered = -1;
      applyHover();
    }


    function render() {
      cards.forEach((card, i) => {
        card.x = i === 0 ? trackX : cards[i - 1].x + cards[i - 1].width + card.leftGap;
      });
      for (const card of cards) {
        const offscreen = card.x + card.width < 0 || card.x > width;
        card.element.style.visibility = offscreen ? "hidden" : "visible";
        if (offscreen) continue;
        card.element.style.transform = `translate3d(${card.x}px, 0, 0)`;
        card.element.style.width = `${card.width}px`;
        card.media.style.transform = `translate3d(${(card.width - mediaWidth) / 2 - card.shift}px, 0, 0)`;
      }
    }


    function applyHover() {
      // Only the three previews react; the featured card and the slivers keep
      // the default shares.
      shares = layout.shares.map((share, column) => {
        if (hovered < 1 || hovered > 3) return share;
        return column === hovered ? share + layout.hoverGain[column] : share - layout.hoverSqueeze[column];
      });
      strip.style.cursor = hovered > 0 ? "pointer" : "";
      animateStrip();
    }


    function animateStrip(prepended = 0) {
      const step = layout.sliverWidth + layout.gap;
      const from = {
        trackX: trackX - prepended * step,
        sliverGrow,
        cards: cards.map((card) => ({ width: card.width, leftGap: card.leftGap, shift: card.shift })),
      };
      const to = {
        trackX: columnOffset * step,
        sliverGrow: sliverGrowTarget(),
        cards: cards.map((card) => ({
          width: cardWidth(card.column),
          leftGap: card.column < 4 ? layout.gap : layout.sliverGap,
          shift: card.column === 0 ? 0 : shifts[card.item],
        })),
      };
      const progress = { t: 0 };
      const mix = (a, b, t) => a + (b - a) * t;


      stripTween?.kill();
      stripTween = gsap.to(progress, {
        t: 1,
        duration: motion.cards.duration,
        ease: motion.cards.ease,
        onUpdate() {
          const t = progress.t;
          trackX = mix(from.trackX, to.trackX, t);
          sliverGrow = mix(from.sliverGrow, to.sliverGrow, t);
          cards.forEach((card, i) => {
            card.width = mix(from.cards[i].width, to.cards[i].width, t);
            card.leftGap = mix(from.cards[i].leftGap, to.cards[i].leftGap, t);
            card.shift = mix(from.cards[i].shift, to.cards[i].shift, t);
          });
          render();
        },
        onComplete: trimCards,
      });
    }


    // Drops the cards that slid out and re-bases columns on the new featured card.
    function trimCards() {
      const first = cards.findIndex((card) => card.column === 0);
      const keep = cards.slice(first, first + visibleCount);
      for (const card of cards) if (!keep.includes(card)) card.element.remove();
      cards = keep;
      columnOffset = 0;
      trackX = 0;
      render();
    }


    function forward(steps) {
      for (let i = 0; i < steps; i += 1) {
        cards.push(makeCard(cycle(cards[cards.length - 1].item + 1), 0));
      }
      columnOffset -= steps;
      cards.forEach((card, i) => { card.column = i + columnOffset; });
      for (const card of cards.slice(-steps)) card.shift = shifts[card.item];
      animateStrip();
    }


    function backward(steps) {
      for (let i = 0; i < steps; i += 1) {
        const card = makeCard(cycle(cards[0].item - 1), 0);
        card.leftGap = layout.gap;
        cards.unshift(card);
      }
      cards.forEach((card, i) => { card.column = i + columnOffset; });
      animateStrip(steps);
    }


    // ---- captions ---------------------------------------------------------


    function showCaption(next) {
      const previous = active;
      active = next;
      captions.forEach((caption, i) => caption.setAttribute("aria-hidden", String(i !== active)));
      if (!split.length) {
        captions.forEach((caption, i) => caption.classList.toggle("is-active", i === active));
        return;
      }


      const { travel, delay, stagger, duration, ease } = motion.text;
      textTween?.progress(1).kill();
      gsap.set(captions[previous], { autoAlpha: 1, zIndex: 1 });
      gsap.set(captions[active], { autoAlpha: 1, zIndex: 2 });
      gsap.set(split[active].lines, { yPercent: travel });


      textTween = gsap.timeline({
        onComplete() {
          gsap.set(captions[previous], { autoAlpha: 0, zIndex: 0 });
          gsap.set(split[previous].lines, { yPercent: travel });
          captions.forEach((caption, i) => caption.classList.toggle("is-active", i === active));
          textTween = null;
        },
      })
        .to(split[previous].lines, { yPercent: -travel, stagger, duration, ease }, 0)
        .to(split[active].lines, { yPercent: 0, stagger, duration, ease }, delay);
    }


    function prepareCaptions() {
      split = captions.map((caption, i) =>
        SplitText.create(caption, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (instance) => gsap.set(instance.lines, { yPercent: i === active ? 0 : motion.text.travel }),
        }));
      captions.forEach((caption, i) => gsap.set(caption, { autoAlpha: i === active ? 1 : 0, zIndex: i === active ? 1 : 0 }));
    }


    // ---- navigation -------------------------------------------------------


    function next(steps = 1) { forward(steps); showCaption(cycle(active + steps)); }
    function previous(steps = 1) { backward(steps); showCaption(cycle(active - steps)); }


    function onPointerMove(event) {
      const x = event.clientX - strip.getBoundingClientRect().left;
      const hit = cards.find((card) => card.x <= x && x <= card.x + card.width);
      const column = hit ? hit.column : -1;
      if (column >= 0 && column !== hovered) { hovered = column; applyHover(); }
    }


    strip.addEventListener("mouseenter", onPointerMove, { signal: events.signal });
    strip.addEventListener("mousemove", onPointerMove, { signal: events.signal });
    strip.addEventListener("mouseleave", () => { hovered = -1; applyHover(); }, { signal: events.signal });
    strip.addEventListener("click", () => { if (hovered > 0) next(hovered); }, { signal: events.signal });
    previousButton.addEventListener("click", () => previous(1), { signal: events.signal });
    nextButton.addEventListener("click", () => next(1), { signal: events.signal });
    root.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") previous(1);
      if (event.key === "ArrowRight") next(1);
    }, { signal: events.signal });


    let resizeTimer = 0;
    const resize = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 150);
    });


    // First paint: the window of cards, sized in place with no motion.
    width = strip.getBoundingClientRect().width;
    height = width / layout.stripRatio;
    strip.style.height = `${height}px`;
    featuredWidth = height * layout.featuredRatio;
    pool = width - featuredWidth - totalGap() - layout.sliverWidth * sliverCount;
    mediaWidth = featuredWidth + pool * (layout.shares[0] + layout.hoverGain[0]);
    for (let i = 0; i < visibleCount; i += 1) cards.push(makeCard(i % count, i));
    for (const card of cards) card.width = cardWidth(card.column);
    render();
    resize.observe(strip);
    (document.fonts?.ready ?? Promise.resolve()).then(() => { if (!destroyed) prepareCaptions(); });


    function destroy() {
      destroyed = true;
      events.abort();
      resize.disconnect();
      clearTimeout(resizeTimer);
      stripTween?.kill();
      textTween?.kill();
      split.forEach((instance) => instance.revert());
      for (const card of cards) card.element.remove();
      cards = [];
      strip.style.height = "";
      strip.style.cursor = "";
      gsap.set(captions, { clearProps: "opacity,visibility,zIndex" });
      delete root.squeezeCleanup;
    }


    root.squeezeCleanup = destroy;
  });
}



