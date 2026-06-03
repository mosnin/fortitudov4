"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AsciiField } from "@/components/dashboard/ascii-field";

// Greeting + a Steve-Jobs-grade positioning line. One pair, picked at random
// each time you enter the dashboard.
const greetings = ["Welcome back", "Good to see you", "Hello again", "Greetings"];
const taglines = [
  "Let's build something insanely great.",
  "Software, the way it should be.",
  "Bespoke. Built. Brilliant.",
  "Where ideas become architecture.",
  "The future, assembled.",
  "Craft at the speed of thought.",
  "Your studio, ready when you are.",
  "Think it. We'll build it.",
];

const easeOut = [0.16, 1, 0.3, 1] as const;

const SEEN_KEY = "ftd_preloader_seen";

export function DashboardPreloader({ name }: { name: string }) {
  const reduce = useReducedMotion();
  // Show once per browser session — not on every dashboard visit.
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(SEEN_KEY)) return;
    sessionStorage?.setItem(SEEN_KEY, "1");
    setShow(true);
  }, []);

  // Picked once per mount → a different saying each time you arrive.
  const { greeting, tagline } = useMemo(
    () => ({
      greeting: greetings[Math.floor(Math.random() * greetings.length)],
      tagline: taglines[Math.floor(Math.random() * taglines.length)],
    }),
    []
  );

  useEffect(() => {
    const t = setTimeout(() => setShow(false), reduce ? 900 : 2000);
    return () => clearTimeout(t);
  }, [reduce]);

  const words = tagline.split(" ");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-charcoal-dark"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)", scale: 1.04 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <AsciiField className="absolute inset-0 h-full w-full opacity-30" cell={14} />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(249,115,22,0.18),transparent_60%)]" />

          <div className="relative z-10 px-6 text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut, delay: 0.1 }}
              className="text-xs uppercase tracking-[0.35em] text-orange/80"
            >
              {greeting}, {name}
            </motion.p>

            <motion.h1
              className="font-brand mt-4 max-w-3xl text-3xl text-white sm:text-5xl lg:text-6xl"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.22 } } }}
            >
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  className="mr-[0.25em] inline-block"
                  variants={{
                    hidden: { opacity: 0, y: "0.5em", filter: "blur(10px)" },
                    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: easeOut } },
                  }}
                >
                  {w}
                </motion.span>
              ))}
            </motion.h1>

            {/* A thin progress sweep that fills over the hold. */}
            <motion.div
              className="mx-auto mt-8 h-px w-40 origin-left overflow-hidden bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="h-full w-full bg-gradient-to-r from-orange to-amber-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reduce ? 0.6 : 1.4, ease: easeOut, delay: 0.3 }}
                style={{ originX: 0 }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
