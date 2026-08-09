"use client";

import {
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  FileWarning,
  GaugeCircle,
  Mail,
  PenTool,
  Receipt,
  Rocket,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { SectionRails } from "./section-rails";

interface Pill {
  icon: LucideIcon;
  label: string;
  duration: number;
  delay: number;
}

const legacyPills: Pill[] = [
  { icon: CalendarClock, label: "Discovery call #4", duration: 1.7, delay: -0.2 },
  { icon: FileWarning, label: "Scope change order", duration: 2.4, delay: -0.8 },
  { icon: Mail, label: "Week-old status email", duration: 2.0, delay: -1.3 },
  { icon: Receipt, label: "Surprise invoice", duration: 1.8, delay: -0.5 },
  { icon: AlertTriangle, label: "Handoff to a stranger", duration: 2.2, delay: -1.7 },
];

const fortitudoPills: Pill[] = [
  { icon: GaugeCircle, label: "Fixed quote", duration: 2.1, delay: -0.4 },
  { icon: Users, label: "Senior architecture", duration: 1.8, delay: -1.1 },
  { icon: Bot, label: "AI-accelerated build", duration: 2.3, delay: -0.7 },
  { icon: CheckCircle2, label: "Live tracker", duration: 1.9, delay: -1.5 },
  { icon: UserCheck, label: "Human review", duration: 2.2, delay: -0.2 },
  { icon: Rocket, label: "Launch", duration: 1.7, delay: -0.9 },
];

function PillConveyor({
  pills,
  tone,
}: {
  pills: Pill[];
  tone: "alert" | "orange";
}) {
  const pillStyles =
    tone === "alert"
      ? "border-alert bg-alert-tint text-alert"
      : "border-orange bg-orange-tint text-orange";
  const connector = tone === "alert" ? "bg-alert" : "bg-orange";
  const ring = tone === "alert" ? "#FF94A4" : "#FDBA74";

  const row = (hidden: boolean) => (
    <div aria-hidden={hidden} className="flex shrink-0 items-center gap-2">
      {pills.map((pill) => {
        const Icon = pill.icon;
        return (
          <div key={pill.label} className="flex shrink-0 items-center gap-2">
            <div
              className={`flex shrink-0 items-center gap-3 rounded-[24px] border-2 p-4 motion-safe:animate-[pill-ring-pulse_2s_ease-in-out_infinite] ${pillStyles}`}
              style={
                {
                  "--pill-ring": ring,
                  animationDuration: `${pill.duration}s`,
                  animationDelay: `${pill.delay}s`,
                } as React.CSSProperties
              }
            >
              <Icon className="size-6 shrink-0" />
              <span className="font-mono text-[22px] leading-none font-normal tracking-[-0.032em] whitespace-nowrap md:text-[24px]">
                {pill.label}
              </span>
            </div>
            <div className={`h-0.5 w-6 shrink-0 ${connector}`} />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-x-clip">
      <div className="flex w-max items-center py-2 motion-safe:animate-[marquee-left_26s_linear_infinite]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export function AdvantageSection() {
  return (
    <section id="how-it-works" className="relative bg-night">
      <SectionRails dark />

      <div className="relative flex flex-col items-center px-4 pt-10 pb-4 md:px-12 md:pt-14 md:pb-6 lg:px-16 lg:pt-16">
        <h2 className="text-center font-mono text-[28px] leading-none font-medium tracking-[-0.032em] text-white md:text-[40px] lg:text-[48px]">
          Our Unique Advantage
        </h2>
      </div>

      <div className="relative border-y border-line-dark px-4 py-6 md:px-12 lg:px-16">
        <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 md:grid-cols-2">
          {/* Legacy agencies */}
          <div className="flex flex-col gap-5">
            <div className="overflow-hidden rounded-[24px] bg-white p-0">
              <div className="relative aspect-[724/322] overflow-hidden rounded-[24px] bg-surface shadow-[0_8px_28px_0_rgba(0,0,0,0.4)]">
                <PillConveyor pills={legacyPills} tone="alert" />
              </div>
            </div>
            <div className="px-1">
              <h3 className="text-[18px] leading-none font-bold tracking-[-0.032em] text-white">
                Typical agencies
              </h3>
              <p className="mt-2.5 max-w-[560px] text-[15px] leading-[1.45] tracking-[-0.015em] text-white/60">
                An endless conveyor of calls, change orders, and week-old
                status emails — with account managers between you and the
                people actually building. The invoice never matches the quote.
              </p>
            </div>
          </div>

          {/* Fortitudo */}
          <div className="flex flex-col gap-5">
            <div className="overflow-hidden rounded-[24px] bg-white p-0">
              <div className="relative aspect-[724/322] overflow-hidden rounded-[24px] bg-panel shadow-[0_8px_28px_0_rgba(0,0,0,0.4)]">
                <PillConveyor pills={fortitudoPills} tone="orange" />
              </div>
            </div>
            <div className="px-1">
              <h3 className="text-[18px] leading-none font-bold tracking-[-0.032em] text-white">
                Fortitudo
              </h3>
              <p className="mt-2.5 max-w-[560px] text-[15px] leading-[1.45] tracking-[-0.015em] text-white/60">
                One senior team in one dashboard. Our AI build agent runs the
                scaffolding, tests, and revision churn under senior review —
                so your build ships weeks faster and you watch it live.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-8 md:h-12" />
    </section>
  );
}
