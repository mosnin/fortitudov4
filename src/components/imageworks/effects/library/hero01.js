// Supplied Web Animation Effects source, browser initializer owned by React.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText, ScrollTrigger);


/** @param {Document | HTMLElement} scope */
export function hero01(scope = document) {
  const mediaWrapper = scope.querySelector("[data-hero-01-media]");
  const image = scope.querySelector(".hero-01__image");
  const overlay = scope.querySelector("[data-hero-01-overlay]");


  if (!mediaWrapper || !image) return;


  gsap.set(mediaWrapper, {
    clipPath: "polygon(50% 20%, 50% 20%, 50% 80%, 50% 80%)",
  });
  gsap.set(image, { scale: 1 });
  gsap.set(overlay, { autoAlpha: 0 });


  gsap
    .timeline({
      defaults: { ease: "power3.out" },
    })
    .to(mediaWrapper, {
      clipPath: "polygon(35% 20%, 65% 20%, 65% 80%, 35% 80%)",
      duration: 1.4,
      ease: "power2.inOut",
    })
    .to(
      image,
      {
        scale: 0.86,
        duration: 1.4,
        ease: "power2.inOut",
      },
      "<",
    )
    .to(
      mediaWrapper,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1.65,
        ease: "power4.inOut",
      },
      "=-.1",
    )
    .to(
      image,
      {
        scale: 1,
        duration: 1.65,
        ease: "power4.inOut",
      },
      "<",
    )
    .to(
      overlay,
      {
        autoAlpha: 1,
        duration: 1.7,
      },
      "<+=.5",
    );
}
