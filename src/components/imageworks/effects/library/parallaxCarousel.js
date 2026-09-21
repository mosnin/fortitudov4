// Supplied Web Animation Effects source, browser initializer owned by React.
// NPM only. CDN users: ignore this block.
import KeenSlider from "keen-slider";
import "keen-slider/keen-slider.min.css";

/** @param {Document | HTMLElement} scope */
export function parallaxCarousel(scope = document) {
  const selector = "[data-parallax-carousel]";
  const roots = scope.matches?.(selector) ? [scope] : scope.querySelectorAll(selector);


  roots.forEach((root) => {
    root.parallaxCarouselCleanup?.();


    const cards = [...root.querySelectorAll(":scope > .card")];
    const media = cards.map((card) => card.querySelector(".media"));
    if (cards.length < 2 || media.some((layer) => !layer)) return;


    const styles = getComputedStyle(root);
    const gap = Number.parseFloat(styles.getPropertyValue("--gap")) || 0;
    const dragSpeed = Number.parseFloat(root.dataset.dragSpeed) || 0.502;
    const lineHeight = Number.parseFloat(styles.lineHeight) || 16;
    const dragGlide = 0.7;
    const wheelResponse = 130;
    const positions = [];
    const offsets = [];
    const events = new AbortController();
    let renderFrame = 0;
    let wheelRemaining = 0;
    let wheelTime = 0;
    let dragged = false;
    let travel = Number.parseFloat(styles.getPropertyValue("--parallax")) || 0;


    media.forEach((layer) => {
      const image = layer.querySelector("img");
      if (!image) return;


      const reveal = async () => {
        try {
          // Decode every card, including offscreen ones, before revealing pixels.
          await image.decode();
          if (!events.signal.aborted) image.setAttribute("data-ready", "");
        } catch {
          // Keep the placeholder; a later source load can retry decoding.
        }
      };


      image.addEventListener("load", reveal, { signal: events.signal });
      if (image.complete && image.naturalWidth > 0) reveal();
    });


    const stopWheel = () => {
      wheelRemaining = 0;
      wheelTime = 0;
    };


    const render = (instance) => {
      const details = instance.track.details;
      if (!details) return;


      let origin = 0;
      details.slides.forEach((slide, index) => {
        // Keen owns motion and looping; this callback only renders its geometry.
        const position = slide.distance * instance.size - origin;
        origin += slide.size * instance.size;
        if (positions[index] !== position) {
          positions[index] = position;
          cards[index].style.transform = `translate3d(${position}px, 0, 0)`;
        }


        if (slide.portion === 0) return;


        // Both distance and size are relative to the carousel width.
        const progress = Math.max(0, Math.min(1, (1 - slide.distance) / (1 + slide.size)));
        const offset = travel * progress;
        if (offsets[index] === offset) return;


        offsets[index] = offset;
        media[index].style.transform = `translate3d(${offset}px, 0, 0)`;
      });
    };


    const flush = (instance, time) => {
      if (wheelRemaining !== 0) {
        const elapsed = wheelTime ? Math.min(time - wheelTime, 64) : 1000 / 60;
        wheelTime = time;
        const step = Math.abs(wheelRemaining) < 0.1
          ? wheelRemaining
          : wheelRemaining * (1 - Math.exp(-elapsed / wheelResponse));
        wheelRemaining -= step;
        // Keep renderFrame set while track.add emits detailsChanged.
        instance.track.add(step / instance.size);
      }


      render(instance);
      renderFrame = 0;
      if (wheelRemaining !== 0) {
        renderFrame = requestAnimationFrame((nextTime) => flush(instance, nextTime));
      } else {
        wheelTime = 0;
      }
    };


    const scheduleRender = (instance) => {
      // Render within Keen's inertia frame; coalesce raw pointer/wheel events.
      if (instance.animator.active) {
        cancelAnimationFrame(renderFrame);
        renderFrame = 0;
        render(instance);
      } else if (!renderFrame) {
        renderFrame = requestAnimationFrame((time) => flush(instance, time));
      }
    };


    const slider = new KeenSlider(root, {
      selector: cards,
      loop: true,
      mode: "free",
      dragSpeed,
      renderMode: "custom",
      slides: { perView: "auto", spacing: gap },
      created(instance) {
        // A glimpse of the previous card, applied only at initialization.
        instance.track.add(-0.06);
        scheduleRender(instance);
      },
      detailsChanged: scheduleRender,
      updated(instance) {
        stopWheel();
        travel = Number.parseFloat(getComputedStyle(root).getPropertyValue("--parallax")) || 0;
        scheduleRender(instance);
      },
      dragStarted() {
        stopWheel();
        dragged = false;
        root.setAttribute("data-dragging", "");
      },
      dragChecked() {
        dragged = true;
      },
      dragEnded(instance) {
        root.removeAttribute("data-dragging");
        if (!dragged) return;


        const velocity = instance.track.velocity();
        const speed = Math.abs(velocity);
        if (!speed) return;


        // Scale Keen's free-mode distance and duration together, keeping its ease.
        const decay = 147e-9 + speed / 1000;
        instance.animator.start([{
          distance: velocity * speed / decay * dragGlide,
          duration: 2 * speed / decay * dragGlide,
          easing: (progress) => 1 - (1 - progress) ** 3,
        }]);
      },
      animationStarted: stopWheel,
    });


    root.addEventListener("wheel", (event) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey) return;
      if (root.hasAttribute("data-dragging") || !slider.track.details) return;


      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      // Preserve native page scrolling; only horizontal gestures control this inline carousel.
      if (!horizontal) return;
      const delta = event.deltaX;
      if (!delta) return;


      const unit = event.deltaMode === 1 ? lineHeight
        : event.deltaMode === 2 ? (horizontal ? slider.size : window.innerHeight) : 1;


      event.preventDefault();
      event.stopPropagation();
      slider.animator.stop();
      // Add wheel distance without restarting a tween or synthesizing a fling.
      wheelRemaining += delta * unit * dragSpeed;
      scheduleRender(slider);
    }, { passive: false, signal: events.signal });


    root.addEventListener("keydown", (event) => {
      if (event.target !== root || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      event.stopPropagation();
      stopWheel();
      event.key === "ArrowRight" ? slider.next() : slider.prev();
    }, { signal: events.signal });


    const stop = () => {
      stopWheel();
      slider.animator.stop();
      cancelAnimationFrame(renderFrame);
      renderFrame = 0;
    };
    const visibility = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stop();
    });
    const resize = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0 && Math.abs(width - slider.size) > 0.5) slider.update();
    });


    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
    }, { signal: events.signal });


    visibility.observe(root);
    resize.observe(root);


    root.parallaxCarouselCleanup = () => {
      events.abort();
      visibility.disconnect();
      resize.disconnect();
      cancelAnimationFrame(renderFrame);
      stop();
      slider.destroy();
      cards.forEach((card) => card.style.removeProperty("transform"));
      media.forEach((layer) => layer.style.removeProperty("transform"));
      root.removeAttribute("data-dragging");
      delete root.parallaxCarouselCleanup;
    };
  });
}



