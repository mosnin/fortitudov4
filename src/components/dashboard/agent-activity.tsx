"use client";

import { AnimatePresence, motion } from "motion/react";
import { DotLoader } from "@/components/ui/dot-loader";

// Live status the agent reports as it works (mirrors BriefStatus on the server).
export type AgentStatus = "thinking" | "searching" | "reviewing" | "building" | "writing";

// Dot-grid frame sets (7×7 = 49 dots; each frame lists the active indices).
// Each status gets a pattern with its own distinct "mood".
const thinking = [
  [9, 16, 17, 15, 23],
  [10, 17, 18, 16, 24],
  [11, 18, 19, 17, 25],
  [18, 25, 26, 24, 32],
  [25, 32, 33, 31, 39],
  [32, 39, 40, 38, 46],
  [31, 38, 39, 37, 45],
  [30, 37, 38, 36, 44],
  [23, 30, 31, 29, 37],
  [31, 29, 37, 22, 24, 23, 38, 36],
  [16, 23, 24, 22, 30],
];

const searching = [
  [0, 2, 4, 6, 20, 34, 48, 46, 44, 42, 28, 14, 8, 22, 36, 38, 40, 26, 12, 10, 16, 30, 24, 18, 32],
  [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47],
  [8, 22, 36, 38, 40, 26, 12, 10, 16, 30, 24, 18, 32],
  [9, 11, 15, 17, 19, 23, 25, 29, 31, 33, 37, 39],
  [16, 30, 24, 18, 32],
  [17, 23, 31, 25],
  [24],
  [17, 23, 31, 25],
  [16, 30, 24, 18, 32],
  [9, 11, 15, 17, 19, 23, 25, 29, 31, 33, 37, 39],
  [8, 22, 36, 38, 40, 26, 12, 10, 16, 30, 24, 18, 32],
  [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47],
];

const reviewing = [
  [45, 38, 31, 24, 17, 23, 25],
  [38, 31, 24, 17, 10, 16, 18],
  [31, 24, 17, 10, 3, 9, 11],
  [24, 17, 10, 3, 2, 4],
  [17, 10, 3],
  [10, 3],
  [3],
  [],
  [45],
  [45, 38, 44, 46],
  [45, 38, 31, 37, 39],
  [45, 38, 31, 24, 30, 32],
];

const building = [
  [],
  [3],
  [10, 2, 4, 3],
  [17, 9, 1, 11, 5, 10, 4, 3, 2],
  [24, 16, 8, 1, 3, 5, 18, 12, 17, 11, 4, 10, 9, 2],
  [31, 23, 15, 8, 10, 2, 4, 12, 25, 19, 24, 18, 11, 17, 16, 9],
  [38, 30, 22, 15, 17, 9, 11, 19, 32, 26, 31, 25, 18, 24, 23, 16],
  [38, 30, 22, 17, 9, 11, 19, 32, 26, 31, 25, 18, 24, 23, 16, 45, 37, 29, 21, 14, 8, 15, 12, 20, 27, 33, 39],
  [38, 30, 22, 15, 17, 9, 11, 19, 32, 26, 31, 25, 18, 24, 23, 16],
  [38, 30, 22, 17, 9, 11, 19, 32, 26, 31, 25, 18, 24, 23, 16, 45, 37, 29, 21, 14, 8, 15, 12, 20, 27, 33, 39],
  [39, 33, 37, 29, 17, 38, 30, 22, 15, 16, 23, 24, 31, 32, 25, 18, 26, 19],
  [17, 30, 16, 23, 24, 31, 32, 25, 18],
  [24],
];

const writing = [
  [14, 15, 16],
  [15, 16, 17],
  [16, 17, 18],
  [17, 18, 19],
  [18, 19, 20],
  [21, 22, 23],
  [22, 23, 24],
  [23, 24, 25],
  [24, 25, 26],
  [25, 26, 27],
];

const STAGES: Record<AgentStatus, { label: string; frames: number[][]; duration: number }> = {
  thinking: { label: "Thinking", frames: thinking, duration: 150 },
  searching: { label: "Searching the web", frames: searching, duration: 170 },
  reviewing: { label: "Reviewing your site", frames: reviewing, duration: 120 },
  building: { label: "Drafting your Blueprint", frames: building, duration: 130 },
  writing: { label: "Writing", frames: writing, duration: 120 },
};

const easeOut = [0.16, 1, 0.3, 1] as const;

/**
 * The "agent is working" indicator. `status` is driven by the live stream so the
 * dots + label reflect what the Brief agent is actually doing right now.
 */
export function AgentActivity({ status }: { status: AgentStatus }) {
  const stage = STAGES[status] ?? STAGES.thinking;

  return (
    <div className="inline-flex items-center gap-3 rounded-3xl rounded-bl-lg border border-border/60 bg-muted px-4 py-3">
      <DotLoader
        key={status}
        frames={stage.frames}
        duration={stage.duration}
        repeatCount={-1}
        className="gap-px"
        dotClassName="size-1 bg-foreground/20 [&.active]:bg-orange"
      />
      <div className="relative h-5 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={status}
            initial={{ y: 14, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -14, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="block whitespace-nowrap text-sm font-medium text-foreground"
          >
            {stage.label}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
