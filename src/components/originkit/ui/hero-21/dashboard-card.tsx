// Delivered by Originkit · stack: nextjs
"use client";

/* Every image in this file is a decorative sub-24px SVG glyph or a tiled noise
 * texture. next/image would add a layout wrapper and an optimizer round-trip
 * to assets that are already smaller than the request to fetch them, so these
 * stay plain <img>. */
/* eslint-disable @next/next/no-img-element */

/** Public asset under /sections/hero-21/assets */
function asset(file: string) {
  return `/originkit/hero-21/${file}`;
}

type Metric = {
  id: string;
  icon: string;
  label: string;
  value: string;
  /** The highlighted light row (Weekly Earnings in the design). */
  highlight?: boolean;
  trend?: boolean;
};

/**
 * The kit shipped this card as a clinical-supervision dashboard: "Active
 * supervisees", "Weekly supervision hours", "Weekly Earnings $1200". It is the
 * largest single element on the homepage, so it was showing a product we do
 * not sell, with money we did not make, above the fold.
 *
 * It now shows the shape of the approval queue, which is the actual thing this
 * page is selling — and the highlighted row is the one that carries the idea:
 * work waits for a person. The numbers are deliberately small and generic, and
 * the section captions itself as an illustration rather than implying a live
 * account.
 */
const METRICS: Metric[] = [
  {
    id: "projects",
    icon: asset("icon-bell.svg"),
    label: "Projects in build",
    value: "04",
  },
  {
    id: "reviews",
    icon: asset("icon-calendar.svg"),
    label: "Client reviews open",
    value: "2 today",
  },
  {
    id: "approvals",
    icon: asset("icon-notes-a.svg"),
    label: "Waiting on your approval",
    value: "03",
    highlight: true,
  },
  {
    // Not a metric — a property of the system. The queue cannot execute an
    // action nobody approved, so this row reads zero by construction rather
    // than by luck, which is the only number on the card worth showing.
    id: "unreviewed",
    icon: asset("icon-clock.svg"),
    label: "Landed without review",
    value: "0",
  },
];

const RowContent = ({ metric }: { metric: Metric }) => (
  <div className="flex w-full items-center justify-between">
    <div className="flex items-center gap-[6.453px]">
      {metric.highlight ? (
        <span className="relative block size-[15.487px] shrink-0">
          <img
            src={asset("icon-notes-a.svg")}
            alt=""
            className="absolute !inset-[28.72%_35.32%_8.34%_8.33%] !h-auto !w-auto" />
          <img
            src={asset("icon-notes-b.svg")}
            alt=""
            className="absolute !inset-[8.33%_10.07%_25.01%_29.17%] !h-auto !w-auto" />
        </span>
      ) : (
        <img
          src={metric.icon}
          alt=""
          width={16}
          height={16}
          className="size-[15.487px] shrink-0" />
      )}
      <p
        className={`font-sans text-[9.034px] font-medium tracking-[-0.0903px] whitespace-nowrap ${
          metric.highlight ? "text-[var(--fx-on-yellow)]" : "text-[var(--fx-white)]"
        }`}
      >
        {metric.label}
      </p>
    </div>

    <div
      className={`flex flex-col items-center justify-center px-[9.034px] py-[6.453px] ${
        metric.highlight ? "rounded-[4px]" : "rounded-[2.581px]"
      }`}
    >
      {metric.trend ? (
        <span className="flex items-center gap-[2.581px]">
          <img
            src={asset("icon-arrow-up.svg")}
            alt=""
            width={8}
            height={8}
            className="size-[7.743px]" />
          <p className="font-sans text-[7.743px] font-medium tracking-[-0.0774px] whitespace-nowrap text-[var(--fx-white)]">
            {metric.value}
          </p>
        </span>
      ) : (
        <p
          className={`font-sans text-[9.034px] font-medium tracking-[-0.0903px] whitespace-nowrap ${
            metric.highlight ? "text-[var(--fx-on-yellow)]" : "text-[var(--fx-white)]"
          }`}
        >
          {metric.value}
        </p>
      )}
    </div>
  </div>
);

/** The floating approval-queue card. Static, as designed. */
export const DashboardCard = ({ className = "" }: { className?: string }) => (
  <div
    // Hidden from assistive tech. It is a drawing of an interface, and a
    // screen reader announcing "Waiting on your approval 03" reads as a
    // statement of fact about the visitor's account rather than as artwork.
    // The visible caption beside it carries the same disclosure for everyone
    // else.
    aria-hidden
    // Heights track the rendered content (198.1 natural, x1.2294 / x1.5497),
    // not Figma's frame box — the frame is ~10% taller than the rows actually
    // occupy, and since the inner block is origin-top-left the slack all fell
    // below the card, reading as off-centre.
    className={`h-[198.1px] w-[325.863px] max-w-full origin-top-left max-[359px]:scale-[0.85] ipad:h-[243.55px] ipad:w-[400.615px] desktop-sm:h-[307px] desktop-sm:w-[505px] ${className}`}
  >
    <div className="w-[325.863px] origin-top-left bg-[var(--fx-charcoal-deep)] p-[1.291px] ipad:scale-[1.2294] desktop-sm:scale-[1.5497]">
      <div className="w-full border-[0.645px] border-[var(--fx-charcoal-raised)] bg-[var(--fx-charcoal)] p-[10.324px]">
        <div className="flex w-full items-center overflow-hidden rounded-[12.905px] border-[0.645px] border-[rgba(255,255,255,0.2)] bg-[var(--fx-charcoal-deep)] p-[12.905px] shadow-[0px_21.939px_5.807px_0px_rgba(0,0,0,0),0px_14.196px_5.807px_0px_rgba(0,0,0,0.01),0px_7.743px_4.517px_0px_rgba(0,0,0,0.05),0px_3.226px_3.226px_0px_rgba(0,0,0,0.09),0px_0.645px_1.936px_0px_rgba(0,0,0,0.1)]">
          <div className="flex min-w-px flex-1 flex-col gap-[7.743px]">
            {METRICS.map((metric) =>
              metric.highlight ? (
                /* Tilted highlight row over its dashed slot */
                <div key={metric.id} className="relative h-[30.973px] w-full">
                  <div className="absolute inset-0 rounded-[6.453px] border-[0.645px] border-dashed border-[var(--fx-muted)] bg-[var(--fx-charcoal)]" />
                  <div className="absolute top-[4.52px] left-[2.94%] w-[97.06%] rotate-[2.5deg] overflow-hidden rounded-[10px] border-[0.645px] border-[var(--fx-yellow)] bg-[var(--fx-yellow)] py-[3.872px] pr-[3.872px] pl-[7.743px] drop-shadow-[0px_0px_0.323px_rgba(102,102,102,0.09)]">
                    <RowContent metric={metric} />
                  </div>
                </div>
              ) : (
                <div
                  key={metric.id}
                  className="flex h-[30.973px] w-full items-center overflow-hidden rounded-[6.453px] border-[0.645px] border-[rgba(255,255,255,0.2)] bg-[var(--fx-charcoal-raised)] py-[3.872px] pr-[3.872px] pl-[7.743px]"
                >
                  <RowContent metric={metric} />
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
