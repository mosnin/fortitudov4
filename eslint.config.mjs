import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Marketing/auth/onboarding UI ported verbatim from the UI-framework
    // reference repo (see design.md). Its internals predate the react-compiler
    // lint rules; the UI is frozen, so the rules are relaxed for these trees.
    files: [
      "src/components/marketing/**",
      "src/components/onboarding/**",
      "src/components/experience/**",
      "src/components/ui/decrypted-text.tsx",
      "src/components/ui/text-flip.tsx",
      "src/components/ui/shimmering-text.tsx",
      "src/components/ui/scroll-direction-carousel.tsx",
      "src/components/ui/logos-carousel.tsx",
      "src/components/ui/animated-gradient-text.tsx",
      "src/components/ui/animated-gradient-background.tsx",
      "src/components/ui/circuit-board.tsx",
      "src/components/ui/footer-reveal.tsx",
    ],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/static-components": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
