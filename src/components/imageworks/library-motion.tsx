"use client";
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { textReveal01 } from "./effects/library/textReveal01";
import { textReveal02 } from "./effects/library/textReveal02";
import { textReveal03 } from "./effects/library/textReveal03";
import { textReveal04 } from "./effects/library/textReveal04";
import { textReveal05 } from "./effects/library/textReveal05";
import { stackedServiceCards } from "./effects/library/stackedServiceCards";
import { stackedScrollPanel3 } from "./effects/library/stackedScrollPanel3";

export function LibraryMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    let disposed = false;
    let context: gsap.Context | undefined;
    const cleanups: Array<() => void> = [];
    document.fonts.ready.then(() => {
      if (disposed) return;
      context = gsap.context(() => {
        [textReveal01, textReveal02, textReveal03, textReveal04, textReveal05].forEach(init => {
          const cleanup = init(scope);
          if (typeof cleanup === "function") cleanups.push(cleanup);
        });
        const stack = stackedServiceCards(scope);
        if (stack) cleanups.push(stack);
        const layers = stackedScrollPanel3(scope);
        if (layers?.destroy) cleanups.push(layers.destroy);
      }, scope);
      ScrollTrigger.refresh();
    });
    return () => { disposed = true; cleanups.forEach(cleanup => cleanup()); context?.revert(); };
  }, []);
  return <div ref={ref} className="library-scope">{children}</div>;
}
