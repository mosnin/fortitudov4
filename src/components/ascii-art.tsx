"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const easeOut = [0.16, 1, 0.3, 1] as const;

/**
 * Hand-drawn ASCII illustrations — each tells the story of a feature. Static
 * art (not the flowing AsciiField), rendered as a <pre>. Use them as feature
 * "images" or, at low opacity, as subtle accents tucked around a layout.
 */
export function AsciiArt({
  art,
  className,
  label,
  animate = true,
}: {
  art: string;
  className?: string;
  label?: string;
  animate?: boolean;
}) {
  const base =
    "select-none whitespace-pre font-mono text-[9px] leading-[1.2] text-orange/70 sm:text-[11px]";
  if (!animate) {
    return (
      <pre aria-hidden={!label} aria-label={label} className={cn(base, className)}>
        {art}
      </pre>
    );
  }
  return (
    <motion.pre
      aria-hidden={!label}
      aria-label={label}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: easeOut }}
      className={cn(base, className)}
    >
      {art}
    </motion.pre>
  );
}

// ── The story art ───────────────────────────────────────────────────────────
// A conversation that becomes a plan — the Brief.
export const briefArt = `
        .· · · · · · · · ·.
       ·   what are we      ·
       ·   building?        ·
        ` + "`" + `· · · · · ·.· · ·´
                    \\
                     \\    .· · · · · · · ·.
                      · ·   a store for    ·
                        ·   my brand  ▍    ·
                         ` + "`" + `· · · · · · · ·´
     ── listening ─── scoping ─── shaping ──`;

// A scoped, measured proposal — the Blueprint.
export const blueprintArt = `
   ┌──────────────────────────────┐
   │ BLUEPRINT              ◷ 6 wks│
   ├──────────────────────────────┤
   │    ╱|          scope ▰▰▰▰▱▱   │
   │   ╱ |          build ▰▰▰▱▱▱   │
   │  ▕█|█▏         price $ ·,···  │
   │  ▕█|█▏                        │
   │  ▔▔▔▔▔   ╴╴╴ to scale ╴╴╴     │
   └──────────────────────────────┘`;

// Phases of tasks, wired in order, flowing to launch — the Build.
export const buildArt = `
   ●─────●─────●╮
    ╲     ╲     ╲
     ●─────●─────●──────▶   ╱▲╲
    ╱     ╱     ╱           ▏█▏
   ●─────●─────●╯           ╱━╲
   ╴ phase 1 ╴ ╴ phase 2 ╴  launch`;

// One signal, answered — the Decision Loop.
export const decisionArt = `
    ·─────────────●─────────────·
                  │
              ┌───┴───┐
            A ◇       ◇ B
              └───┬───┘
                  ▼
        one question — answered`;

// Shipped, live, and yours — Launch.
export const launchArt = `
            · ─── ─── ·
         ·´  ▞▚▞▚▞▚▞▚  ` + "`" + `·
        :   ▚▞▚▞══▞▚▞    :
        :   ▞▚▞▚══▚▞▚    :
         ` + "`" + `·  ▚▞▚▞▚▞▚▞  ·´
             ` + "`" + ` ─── ─── ´
                 ╲
                  ╲──── ✦ live & yours`;

// A two-way, encrypted handshake — the Credentials vault.
export const vaultArt = `
   you ▢──────────╮        ╭──────────▢ studio
                  ▼        ▼
              ┌── ▣ ───────── ▣ ──┐
              │  ●●●●●●   ⇄   ●●●●●● │
              └─────── encrypted ────┘`;

// Agents working the same build, with a human in the loop — the Agent API / MCP.
export const agentArt = `
   ┌─ mcp ──────────────────────────┐
   │ > claim_task   #4 hero section  │
   │ > submit_task  ▍                │
   │ ── awaiting human review ───────│
   └────────────────────────────────┘
          △ you approve ─ or ─ revise`;
