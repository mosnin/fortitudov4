"use client";
import { SmoothScroll } from "./smooth-scroll";
import { ReducedMotionProvider } from "./lib/motion";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReducedMotionProvider>
      <SmoothScroll>{children}</SmoothScroll>
    </ReducedMotionProvider>
  );
}
