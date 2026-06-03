"use client";

import { useState } from "react";
import { motion } from "motion/react";

// A different welcome line on every load, with the user's name woven in.
const lines = (name: string): string[] => {
  const hour = new Date().getHours();
  const tod = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return [
    `${tod}, ${name}.`,
    `Welcome back, ${name}.`,
    `Good to see you, ${name}.`,
    `Let's build, ${name}.`,
    `Ready when you are, ${name}.`,
    `What are we shipping, ${name}?`,
    `The studio's yours, ${name}.`,
    `Back at it, ${name}.`,
  ];
};

export function WelcomeRotator({ name, className }: { name: string; className?: string }) {
  // Pick once per mount (i.e. per page load).
  const [line] = useState(() => {
    const all = lines(name);
    return all[Math.floor(Math.random() * all.length)];
  });

  return (
    <motion.h1
      key={line}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {line}
    </motion.h1>
  );
}
