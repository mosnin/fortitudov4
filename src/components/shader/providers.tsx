"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { ReducedMotionProvider } from "@/components/shader/lib/motion";
import { ShaderVariantProvider } from "@/components/shader/shader-variant-context";
import { SmoothScroll } from "@/components/shader/smooth-scroll";

export function Providers({ children }: { children: ReactNode }): ReactNode {
  return (
    <ReducedMotionProvider>
      <MotionConfig reducedMotion="user">
        <ShaderVariantProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ShaderVariantProvider>
      </MotionConfig>
    </ReducedMotionProvider>
  );
}
