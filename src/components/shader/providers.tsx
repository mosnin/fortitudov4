"use client";

import { MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { ReducedMotionProvider } from "@/components/shader/lib/motion";
import { ShaderVariantProvider } from "@/components/shader/shader-variant-context";
import { SmoothScroll } from "@/components/shader/smooth-scroll";
import { resetShutter } from "@/lib/page-shutter";

export function Providers({ children }: { children: ReactNode }): ReactNode {
  useEffect(() => {
    // The legacy auth layout covers outgoing links with its own shutter.
    // Shader does not mount that transition, so release its global overlay
    // on arrival. Otherwise returning from sign-in leaves every link blocked.
    resetShutter();
  }, []);

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
