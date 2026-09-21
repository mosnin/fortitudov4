/* Supplied Web Animation Effects source; client lifecycle owned by LibraryMotion. */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
gsap.registerPlugin(ScrollTrigger);


/** @param {Document | HTMLElement} scope */
function stackedServiceCards(scope = document) {
  const root = scope.querySelector("[data-stacked-scroll-panel-2]");
  if (!root) return () => {};


  root.__stackedServiceCardsCleanup?.();


  const stack = root.querySelector("[data-card-stack]");
  const cards = [...root.querySelectorAll("[data-card]")];
  if (!stack || cards.length < 2) return () => {};


  const motion = {
    entryOffset: () => {
      const cardHeight = cards[0].offsetHeight;
      const clearsViewport = (window.innerHeight + cardHeight) / 2 + 40;


      return Math.max(cardHeight * 1.2, clearsViewport);
    },
    layerOffset: 60,
    layerScaleStep: 0.05,
    desktopScrollDistance: "+=250%",
    mobileEntryY: "15%",
  };


  const responsive = gsap.matchMedia();


  responsive.add(
    {
      desktop: "(min-width: 1025px)",
      mobile: "(max-width: 1024px)",
    },
    (context) => {
      const { desktop } = context.conditions;


      if (desktop) {
        gsap.set(cards, {
          zIndex: (index) => index,
          y: (index) => (index === 0 ? 0 : motion.entryOffset()),
          scale: 1,
          visibility: (index) => (index === 0 ? "visible" : "hidden"),
        });


        gsap.fromTo(
          cards[0],
          { scale: 1.05 },
          {
            scale: 1,
            scrollTrigger: {
              trigger: cards[0],
              start: "top 110%",
              end: "center center",
              scrub: 0,
            },
          },
        );


        const timeline = gsap.timeline({
          defaults: { duration: 1 },
          scrollTrigger: {
            trigger: cards[0],
            start: "center center",
            end: motion.desktopScrollDistance,
            scrub: 0,
            pin: stack,
            pinSpacing: true,
            anticipatePin: 0,
            invalidateOnRefresh: true,
          },
        });


        for (let phase = 1; phase < cards.length; phase += 1) {
          const label = `phase-${phase}`;
          timeline.addLabel(label);
          timeline.set(cards[phase], { visibility: "visible" }, label);


          for (let index = 0; index < phase; index += 1) {
            const depth = phase - index;
            timeline.to(
              cards[index],
              {
                y: -motion.layerOffset * depth,
                scale: 1 - motion.layerScaleStep * depth,
              },
              label,
            );
          }


          timeline.to(cards[phase], { y: 0, scale: 1 }, label);
        }


        return;
      }


      gsap.set(cards, {
        clearProps: "transform,zIndex,visibility",
      });


      cards.forEach((card) => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: card,
              start: "-10% bottom",
              end: "60% center",
              scrub: 1,
            },
          })
          .fromTo(
            card,
            { y: motion.mobileEntryY, scale: 0.95 },
            { y: 0, scale: 1 },
          );
      });
    },
    root,
  );


  const cleanup = () => {
    responsive.revert();
    if (root.__stackedServiceCardsCleanup === cleanup) {
      delete root.__stackedServiceCardsCleanup;
    }
  };


  root.__stackedServiceCardsCleanup = cleanup;
  return cleanup;
}

export { stackedServiceCards };
