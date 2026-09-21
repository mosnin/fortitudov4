// NPM only. CDN users: ignore this block.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const stackedScrollPanelInstances = new WeakMap();

const stackedScrollPanelMotion = {
  phone: {
    enterStart: "top 88%",
    enterEnd: "top 50%",
    pinStart: "top 88%",
    pinEnd: "top -20%",
    exitY: "-18%",
    exitZ: -80,
    exitRotationX: 14,
  },
  "large-phone": {
    enterStart: "top 85%",
    enterEnd: "top 45%",
    pinStart: "top 86%",
    pinEnd: "top -30%",
    exitY: "-24%",
    exitZ: -120,
    exitRotationX: 18,
  },
  tablet: {
    enterStart: "top 83%",
    enterEnd: "top 30%",
    pinStart: "top 88%",
    pinEnd: "top -48%",
    exitY: "-36%",
    exitZ: -180,
    exitRotationX: 26,
  },
  desktop: {
    enterStart: "top 80%",
    enterEnd: "top 20%",
    pinStart: "top 100%",
    pinEnd: "top -75%",
    exitY: "-50%",
    exitZ: -250,
    exitRotationX: 45,
  },
};

/** @param {Document | Element} scope */
export function stackedScrollPanels(scope = document) {
  const root = scope.querySelector("[data-stacked-scroll-panels]");
  if (!root) return () => {};

  stackedScrollPanelInstances.get(root)?.();

  const panels = [...root.querySelectorAll(".stacked-scroll-panel")];
  const responsive = gsap.matchMedia();

  responsive.add(
    {
      desktop: "(min-width: 1025px)",
      tablet: "(min-width: 768px) and (max-width: 1024px)",
      largePhone: "(min-width: 480px) and (max-width: 767px)",
      phone: "(max-width: 479px)",
    },
    (context) => {
      const conditions = context.conditions || {};
      const tier = conditions.desktop
        ? "desktop"
        : conditions.tablet
          ? "tablet"
          : conditions.largePhone
            ? "large-phone"
            : "phone";
      const motion = stackedScrollPanelMotion[tier];
      const pinsPanels = tier === "desktop";

      root.dataset.tier = tier;

      panels.forEach((panel, index) => {
        const inner = panel.querySelector(".stacked-scroll-panel__inner");
        if (!inner) return;

        const entranceScale = index === 0 ? 0.84 : 0.92;

        gsap.fromTo(
          inner,
          { scale: entranceScale },
          {
            scale: 1,
            scrollTrigger: {
              trigger: panel,
              start: motion.enterStart,
              end: motion.enterEnd,
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );

        if (!pinsPanels || index >= panels.length - 1) {
          gsap.set(inner, { "--after-opacity": 0 });
          return;
        }

        const nextPanel = panels[index + 1];

        gsap.fromTo(
          inner,
          {
            y: "0%",
            z: 0,
            rotationX: 0,
            opacity: 1,
          },
          {
            y: motion.exitY,
            z: motion.exitZ,
            rotationX: motion.exitRotationX,
            scale: 0.92,
            opacity: 0,
            scrollTrigger: {
              trigger: nextPanel,
              start: motion.pinStart,
              end: motion.pinEnd,
              scrub: true,
              pin: panel,
              pinSpacing: false,
              invalidateOnRefresh: true,
            },
          },
        );

        ScrollTrigger.create({
          trigger: nextPanel,
          start: "top top",
          onEnter: () => inner.classList.add("is-fully-retired"),
          onLeaveBack: () => inner.classList.remove("is-fully-retired"),
        });

        gsap.to(inner, {
          "--after-opacity": 1,
          scrollTrigger: {
            trigger: nextPanel,
            start: "top 75%",
            end: "top 0%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });

      return () => {
        panels.forEach((panel) => {
          panel
            .querySelector(".stacked-scroll-panel__inner")
            ?.classList.remove("is-fully-retired");
        });
      };
    },
    root,
  );

  const cleanup = () => {
    responsive.revert();
    if (stackedScrollPanelInstances.get(root) === cleanup) {
      stackedScrollPanelInstances.delete(root);
    }
  };

  stackedScrollPanelInstances.set(root, cleanup);
  return cleanup;
}
