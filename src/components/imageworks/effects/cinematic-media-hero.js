// Canonical implementation supplied by the user; lifecycle is owned by React.
import "number-flow";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText);

CustomEase.create("hero-section-01-text", "0.1, 0, 0, 1");

/** @param {Document | Element} scope */
export function cinematicMediaHero(
  scope = document,
  { smoothScroll = true, lenis: existingLenis = null } = {},
) {
  const root = scope.querySelector("[data-hero-section-01]");
  if (!root) return;

  root.heroSection01Cleanup?.();
  root.dataset.introPhase = "loading";

  const next = scope.querySelector("[data-hero-next]");
  const media = [...root.querySelectorAll(".media > .item")];
  const thumbs = [...root.querySelectorAll(".thumbs button")];
  const thumbGroup = root.querySelector(".thumbs");
  const initialVisual = media[0]?.firstElementChild;
  const videos = media
    .map((item, index) => ({
      index,
      video: item.firstElementChild?.matches("video")
        ? item.firstElementChild
        : null,
    }))
    .filter(({ video }) => video);
  const loader = root.querySelector(".loader");
  const panels = loader?.querySelectorAll(".panel");
  const progressTrack = loader?.querySelector(".progress");
  const line = loader?.querySelector(".line");
  const count = loader?.querySelector(".count");
  const title = root.querySelector("h1");
  const copy = root.querySelector(".content > p");
  const navItems = root.querySelectorAll("[data-hero-nav] > *");

  if (
    !next ||
    !initialVisual ||
    !loader ||
    panels?.length !== 2 ||
    !progressTrack ||
    !line ||
    !count ||
    !title ||
    !copy ||
    !thumbGroup ||
    media.length !== thumbs.length
  ) {
    return;
  }

  const settings = {
    breakpoint: 700,
    desktopParallaxY: 30,
    media: {
      duration: 2.35,
      ease: "expo.out",
      handoffWindow: 1,
    },
  };

  const ownsLenis = smoothScroll && !existingLenis;
  const lenis = existingLenis ||
    (ownsLenis
      ? new Lenis({
          autoRaf: false,
          lerp: 0.12,
          smoothWheel: true,
        })
      : null);
  const updateLenis = (time) => lenis?.raf(time * 1000);

  if (ownsLenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);
  }

  const controller = new AbortController();
  const responsive = gsap.matchMedia();
  let nextTween;
  let introTimeline;
  let switchTimeline;
  let titleSplit;
  let copySplit;
  let visibilityTrigger;
  let activeIndex = 0;
  let pendingIndex = null;
  let switching = false;
  let ready = false;
  let heroVisible = next.getBoundingClientRect().top > 0;

  const syncVideoPlayback = () => {
    root.dataset.heroVisible = String(heroVisible);
    videos.forEach(({ index, video: itemVideo }) => {
      const shouldPlay =
        heroVisible && !document.hidden && root.dataset.motionPaused !== "true" && index === activeIndex;

      if (shouldPlay) itemVideo.play().catch(() => {});
      else itemVideo.pause();
    });
  };

  videos.forEach(({ index, video: itemVideo }) => {
    itemVideo.autoplay = index === 0;
    itemVideo.defaultMuted = true;
    itemVideo.muted = true;
    itemVideo.loop = true;
    itemVideo.playsInline = true;
    if (!itemVideo.hasAttribute("preload")) {
      itemVideo.preload = index === 0 ? "auto" : "metadata";
    }
    itemVideo.toggleAttribute("autoplay", index === 0);
    itemVideo.setAttribute("muted", "");
    itemVideo.setAttribute("loop", "");
    itemVideo.setAttribute("playsinline", "");
  });

  root.addEventListener("hero-playback-change", syncVideoPlayback, { signal: controller.signal });
  document.addEventListener("visibilitychange", syncVideoPlayback, {
    signal: controller.signal,
  });

  gsap.set(loader, { display: "" });
  gsap.set(panels, { yPercent: 0 });
  gsap.set(progressTrack, { "--track-opacity": 1 });
  gsap.set(line, { scaleX: 0, transformOrigin: "center" });
  gsap.set(count, { autoAlpha: 1 });
  gsap.set(thumbGroup, {
    "--background-alpha": 0,
    "--blur": "0px",
  });
  count.format = { style: "percent", maximumFractionDigits: 0 };
  count.trend = 1;
  count.animated = false;
  count.update(0);
  count.animated = true;

  media.forEach((item, index) => {
    const visual = item.firstElementChild;
    const isActive = index === 0;

    item.classList.toggle("active", index === 0);
    gsap.set(item, {
      zIndex: isActive ? 1 : 0,
      clipPath: isActive ? "inset(0)" : "inset(0 0 0 100%)",
    });
    gsap.set(visual, {
      xPercent: 0,
      scale: isActive ? 1.4 : 1,
    });
  });

  thumbs.forEach((thumb, index) => {
    thumb.classList.toggle("active", index === 0);
    thumb.setAttribute("aria-pressed", String(index === 0));
  });

  responsive.add(`(min-width: ${settings.breakpoint + 1}px)`, () => {
    gsap.to(root, {
      yPercent: settings.desktopParallaxY,
      ease: "power1.in",
      scrollTrigger: {
        trigger: root,
        endTrigger: next,
        start: "top top",
        end: "top top",
        scrub: true,
      },
    });
  });

  nextTween = gsap.fromTo(
    next,
    {
      borderRadius: () =>
        innerWidth <= settings.breakpoint
          ? "18px 18px 0 0"
          : "24px 24px 0 0",
    },
    {
      borderRadius: 0,
      ease: "none",
      scrollTrigger: {
        trigger: next,
        start: "top bottom",
        end: "top top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  );

  visibilityTrigger = ScrollTrigger.create({
    trigger: next,
    start: "top top",
    onEnter: () => {
      heroVisible = false;
      syncVideoPlayback();
    },
    onLeaveBack: () => {
      heroVisible = true;
      syncVideoPlayback();
    },
  });

  syncVideoPlayback();

  const switchMedia = (index) => {
    const outgoingIndex = activeIndex;
    const outgoing = media[outgoingIndex];
    const incoming = media[index];
    const outgoingMedia = outgoing.firstElementChild;
    const incomingMedia = incoming.firstElementChild;
    const outgoingVideo = outgoing.querySelector("video");
    const incomingVideo = incoming.querySelector("video");

    switching = true;
    pendingIndex = null;

    thumbs[outgoingIndex].classList.remove("active");
    thumbs[outgoingIndex].setAttribute("aria-pressed", "false");
    thumbs[index].classList.add("active");
    thumbs[index].setAttribute("aria-pressed", "true");
    activeIndex = index;

    if (heroVisible && !document.hidden && root.dataset.motionPaused !== "true") {
      incomingVideo?.play().catch(() => {});
    }

    gsap.set(outgoing, { zIndex: 1, clipPath: "inset(0)" });
    gsap.set(incoming, {
      zIndex: 2,
      clipPath: "inset(0 0 0 100%)",
    });
    gsap.set(outgoingMedia, { xPercent: 0, scale: 1 });
    gsap.set(incomingMedia, { xPercent: 10, scale: 1.2 });

    switchTimeline = gsap
      .timeline({
        defaults: {
          duration: settings.media.duration,
          ease: settings.media.ease,
        },
        onComplete: () => {
          outgoing.classList.remove("active");
          incoming.classList.add("active");

          gsap.set(outgoing, {
            zIndex: 0,
            clipPath: "inset(0 0 0 100%)",
          });
          gsap.set(incoming, { zIndex: 1, clipPath: "inset(0)" });
          gsap.set([outgoingMedia, incomingMedia], {
            xPercent: 0,
            scale: 1,
          });

          outgoingVideo?.pause();
          syncVideoPlayback();
          switching = false;
          switchTimeline = null;

          const queuedIndex = pendingIndex;
          pendingIndex = null;
          if (queuedIndex !== null && queuedIndex !== activeIndex) {
            switchMedia(queuedIndex);
          }
        },
      })
      .to(outgoingMedia, { xPercent: -10 }, 0)
      .to(incoming, { clipPath: "inset(0 0 0 0%)" }, 0)
      .to(incomingMedia, { xPercent: 0, scale: 1 }, 0);
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener(
      "click",
      () => {
        if (!ready) return;

        if (switching) {
          const remaining =
            switchTimeline.duration() - switchTimeline.time();

          if (
            index !== activeIndex &&
            remaining <= settings.media.handoffWindow
          ) {
            pendingIndex = index;
            switchTimeline.progress(1);
          }
          return;
        }

        if (index !== activeIndex) switchMedia(index);
      },
      { signal: controller.signal },
    );
  });

  let titleReveal;
  let copyReveal;
  let titleStarted = false;
  let copyStarted = false;

  titleSplit = SplitText.create(title, {
    type: "words, chars",
    wordsClass: "split-word",
    charsClass: "split-char",
    autoSplit: true,
    onSplit(self) {
      titleReveal = gsap.fromTo(
        self.chars,
        { yPercent: -100, y: "-0.25em" },
        {
          yPercent: 0,
          y: 0,
          duration: 0.75,
          stagger: 0.005,
          ease: "hero-section-01-text",
          paused: !titleStarted,
        },
      );

      return titleReveal;
    },
  });

  copySplit = SplitText.create(copy, {
    type: "words, chars",
    wordsClass: "split-word",
    charsClass: "split-char",
    autoSplit: true,
    onSplit(self) {
      copyReveal = gsap.fromTo(
        self.chars,
        { yPercent: -100, y: "-0.25em" },
        {
          yPercent: 0,
          y: 0,
          duration: 0.75,
          stagger: 0.005,
          ease: "hero-section-01-text",
          paused: !copyStarted,
        },
      );

      return copyReveal;
    },
  });

  const progress = { value: 0 };

  introTimeline = gsap.timeline();

  introTimeline
    .to(progress, {
      value: 100,
      duration: 1.5,
      ease: "expo.out",
      onUpdate: () => {
        count.update(Math.round(progress.value) / 100);
      },
    })
    .to(line, { scaleX: 1, duration: 1.5, ease: "expo.out" }, 0)
    .addLabel("reveal")
    .to(count, { autoAlpha: 0, duration: 0.35, ease: "power1.out" }, "reveal")
    .to(
      line,
      {
        scaleX: 0,
        transformOrigin: "right center",
        duration: 1.5,
        ease: "power4.inOut",
      },
      "reveal",
    )
    .to(
      progressTrack,
      {
        "--track-opacity": 0,
        duration: 1.5,
        ease: "power1.out",
      },
      "reveal",
    )
    .to(panels[0], { yPercent: -100, duration: 1.5, ease: "power4.inOut" }, "reveal")
    .to(panels[1], { yPercent: 100, duration: 1.5, ease: "power4.inOut" }, "reveal")
    .to(initialVisual, { scale: 1, duration: 1.5, ease: "power4.out" }, "reveal+=0.5")
    .call(
      () => {
        titleStarted = true;
        titleReveal.play();
      },
      [],
      "reveal+=0.7",
    )
    .call(
      () => {
        copyStarted = true;
        copyReveal.play();
      },
      [],
      "reveal+=0.4",
    )
    .from(
      thumbs,
      {
        yPercent: -120,
        duration: 0.75,
        stagger: 0.1,
        ease: "hero-section-01-text",
      },
      "reveal+=0.8",
    )
    .to(
      thumbGroup,
      {
        "--background-alpha": 0.314,
        "--blur": "10px",
        duration: 0.6,
        ease: "power2.out",
      },
      "reveal+=0.8",
    )
    .set(loader, { display: "none" }, "reveal+=1.5")
    .call(
      () => {
        ready = true;
      },
      [],
      "reveal+=1.5",
    );

  if (navItems.length) introTimeline.from(navItems, {
    yPercent: -120, duration: 0.75, stagger: 0.08, ease: "hero-section-01-text",
  }, "reveal+=0.95");

  introTimeline.call(() => { root.dataset.introPhase = "ready"; }, [], "reveal+=0.95");

  root.heroSection01Cleanup = () => {
    controller.abort();
    videos.forEach(({ video: itemVideo }) => itemVideo.pause());
    if (ownsLenis) {
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    }
    switchTimeline?.kill();
    introTimeline?.kill();
    nextTween?.scrollTrigger?.kill();
    nextTween?.kill();
    visibilityTrigger?.kill();
    responsive.revert();
    titleSplit?.revert();
    copySplit?.revert();
    gsap.killTweensOf([root, next, ...root.querySelectorAll("*")]);
    delete root.heroSection01Cleanup;
  };

  return root.heroSection01Cleanup;
}
