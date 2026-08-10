"use client";

/**
 * Gadgets on the client portal.
 *
 * These are built for one client and shared deliberately, so they are
 * presented as part of their account rather than as a novelty — no "made by
 * AI" badge, no version numbers, none of the agency-side vocabulary. From the
 * client's side it is simply a tool that is theirs.
 *
 * Each renders in the same sandbox as on the agency side: opaque origin, no
 * network, reads only what the thread behind it was introduced to.
 */

import { useEffect, useState } from "react";
import { CrmPageHeader, SectionHead } from "@/components/crm";
import { Reveal } from "@/components/motion";
import { GadgetFrame } from "@/components/admin/gadget-frame";
import { BODY_MUTED } from "@/lib/typography";
import { cn } from "@/lib/utils";

interface Gadget {
  id: string;
  name: string;
  summary: string | null;
  source: Record<string, string>;
  version: number;
}

export function ClientGadgets() {
  const [gadgets, setGadgets] = useState<Gadget[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/helix/client-gadgets");
      if (!response.ok) {
        if (!cancelled) setGadgets([]);
        return;
      }
      const data = (await response.json()) as { gadgets: Gadget[] };
      if (!cancelled) setGadgets(data.gadgets);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <CrmPageHeader
          section="Your account."
          title="Tools"
          subtitle={
            gadgets === null
              ? undefined
              : gadgets.length === 0
                ? "Nothing here yet."
                : `${gadgets.length} tool${gadgets.length === 1 ? "" : "s"} built for you.`
          }
        />

        {gadgets === null ? (
          <div className="h-64 animate-pulse rounded-lg bg-muted/50" />
        ) : gadgets.length === 0 ? (
          <Reveal variant="fade">
            <p className={cn(BODY_MUTED, "py-10")}>
              When the team builds something specific to your project — a
              tracker, a calculator, a live view of your numbers — it appears
              here.
            </p>
          </Reveal>
        ) : (
          <div className="space-y-10">
            {gadgets.map((gadget) => (
              <section key={gadget.id} className="space-y-3">
                <SectionHead
                  title={gadget.name}
                  meta={gadget.summary ?? undefined}
                />
                <GadgetFrame
                  gadgetId={gadget.id}
                  source={gadget.source}
                  title={gadget.name}
                />
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
