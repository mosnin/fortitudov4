"use client";

/**
 * The gadgets index and viewer.
 *
 * A gadget is software Helix wrote, so the list leads with the two facts that
 * decide what to do with one: which client it is for, and whether that client
 * can already see it. Sharing state is a word, not a colour — a client-visible
 * gadget is a fact about the world, not a status to decorate.
 */

import { useCallback, useEffect, useState } from "react";
import {
  CrmPageHeader,
  RecordList,
  RecordListSkeleton,
  RecordRow,
  RowPill,
  SectionHead,
} from "@/components/crm";
import { Reveal } from "@/components/motion";
import { GadgetFrame } from "./gadget-frame";
import { BODY_MUTED, CAPTION, GHOST_PILL, META } from "@/lib/typography";
import { cn } from "@/lib/utils";

interface GadgetRow {
  id: string;
  name: string;
  summary: string | null;
  version: number;
  status: "draft" | "live" | "archived";
  sharedWithClient: boolean;
  updatedAt: string;
  client: string | null;
}

export function HelixGadgets() {
  const [gadgets, setGadgets] = useState<GadgetRow[] | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/helix/gadgets");
      if (!response.ok) {
        setGadgets([]);
        return;
      }
      const data = (await response.json()) as { gadgets: GadgetRow[] };
      setGadgets(data.gadgets);
    })();
  }, []);

  const shared = (gadgets ?? []).filter((g) => g.sharedWithClient).length;

  return (
    <div className="space-y-8 pb-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <CrmPageHeader
          section="Helix."
          title="Gadgets"
          subtitle={
            gadgets === null
              ? undefined
              : gadgets.length === 0
                ? "None yet. Ask Helix in a thread to build one for a client."
                : `${gadgets.length} built, ${shared} on a client portal.`
          }
        />

        {gadgets === null ? (
          <RecordListSkeleton rows={3} />
        ) : gadgets.length === 0 ? (
          <Reveal variant="fade">
            <p className={cn(BODY_MUTED, "py-10")}>
              A gadget is a small private app for one client — a tracker, a
              calculator, a dashboard. It runs sandboxed with no network access
              and stays invisible to the client until you share it.
            </p>
          </Reveal>
        ) : (
          <RecordList>
            {gadgets.map((gadget, index) => (
              <RecordRow
                key={gadget.id}
                index={index}
                href={`/admin/helix/gadgets/${gadget.id}`}
                primary={gadget.name}
                status={
                  gadget.sharedWithClient ? (
                    <RowPill emphasis>Client can see this</RowPill>
                  ) : (
                    <RowPill>Draft</RowPill>
                  )
                }
                secondary={
                  [gadget.client, gadget.summary].filter(Boolean).join(" · ") ||
                  undefined
                }
                meta={<span className={META}>v{gadget.version}</span>}
              />
            ))}
          </RecordList>
        )}
      </div>
    </div>
  );
}

interface GadgetDetail {
  id: string;
  name: string;
  summary: string | null;
  source: Record<string, string>;
  version: number;
  sharedWithClient: boolean;
  client: string | null;
}

interface VersionRow {
  id: string;
  version: number;
  note: string | null;
  createdAt: string;
}

export function HelixGadgetView({ gadgetId }: { gadgetId: string }) {
  const [gadget, setGadget] = useState<GadgetDetail | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch(`/api/helix/gadgets/${gadgetId}`);
    if (!response.ok) {
      setError("Could not load that gadget.");
      return;
    }
    const data = (await response.json()) as {
      gadget: GadgetDetail;
      versions: VersionRow[];
    };
    setGadget(data.gadget);
    setVersions(data.versions);
  }, [gadgetId]);

  useEffect(() => {
    void load();
  }, [load]);

  const restore = useCallback(
    async (version: number) => {
      setBusy(true);
      try {
        await fetch(`/api/helix/gadgets/${gadgetId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restoreVersion: version,
            note: `Restored v${version}`,
          }),
        });
        await load();
      } finally {
        setBusy(false);
      }
    },
    [gadgetId, load]
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <CrmPageHeader
          section="Gadget."
          title={gadget?.name ?? "Gadget"}
          subtitle={
            gadget
              ? [
                  gadget.client,
                  `v${gadget.version}`,
                  gadget.sharedWithClient
                    ? "on the client's portal"
                    : "draft — the client cannot see it",
                ]
                  .filter(Boolean)
                  .join(" · ")
              : undefined
          }
        />

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {gadget && (
          <>
            <p className={CAPTION}>
              Running sandboxed: no network access, no cookies, and no reach
              into this page. It can read only what its thread was introduced
              to.
            </p>
            <GadgetFrame
              gadgetId={gadget.id}
              source={gadget.source}
              title={gadget.name}
            />
          </>
        )}

        {versions.length > 0 && (
          <section className="space-y-3">
            <SectionHead title="History" meta={`${versions.length} kept`} />
            <ul className="divide-y divide-border/60">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">v{version.version}</p>
                    {version.note && (
                      <p className={CAPTION}>{version.note}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void restore(version.version)}
                    className={cn(GHOST_PILL, busy && "opacity-50")}
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
