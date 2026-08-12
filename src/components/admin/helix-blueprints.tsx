"use client";

/**
 * The blueprint shelf.
 *
 * Installing is a copy, not a subscription, and the copy is yours to change —
 * so the card says which client it will be installed for and nothing about
 * updates, because there are none. That trade is the point, and it should be
 * legible from the shelf rather than discovered later.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RowSelect, SectionHead } from "@/components/crm";
import {
  BODY_MUTED,
  CAPTION,
  GHOST_PILL,
  META,
  PRIMARY_PILL,
  SECTION_LABEL,
} from "@/lib/typography";
import { cn } from "@/lib/utils";

interface BuiltIn {
  slug: string;
  name: string;
  summary: string;
  category: string;
  files: string[];
}

interface Published {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  category: string;
  installCount: number;
}

interface ClientOption {
  id: string;
  companyName: string;
}

export function HelixBlueprints({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [builtIn, setBuiltIn] = useState<BuiltIn[]>([]);
  const [published, setPublished] = useState<Published[]>([]);
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/helix/blueprints");
      if (!response.ok) return;
      const data = (await response.json()) as {
        builtIn: BuiltIn[];
        published: Published[];
      };
      setBuiltIn(data.builtIn);
      setPublished(data.published);
    })();
  }, []);

  const install = useCallback(
    async (key: string, payload: { slug?: string; blueprintId?: string }) => {
      if (!clientId) {
        setError("Add a client first — a gadget is always for someone.");
        return;
      }
      setBusy(key);
      setError(null);
      try {
        const response = await fetch("/api/helix/blueprints/install", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, clientId }),
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body?.error ?? "Could not install.");
        router.push(`/admin/helix/gadgets/${body.gadget.id}`);
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Could not install."
        );
        setBusy(null);
      }
    },
    [clientId, router]
  );

  return (
    <section className="space-y-4">
      <SectionHead
        title="Blueprints"
        meta={
          clients.length > 0 ? (
            <label className="flex items-center gap-1.5">
              <span className={META}>Install for</span>
              <RowSelect
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.companyName}
                  </option>
                ))}
              </RowSelect>
            </label>
          ) : undefined
        }
      />

      <p className={CAPTION}>
        Installing copies the source into a gadget you own. Yours to change from
        that moment — later edits to the blueprint do not reach it.
      </p>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <ul className="grid gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
        {builtIn.map((blueprint) => (
          <BlueprintCard
            key={blueprint.slug}
            name={blueprint.name}
            summary={blueprint.summary}
            meta={blueprint.category}
            busy={busy === blueprint.slug}
            onInstall={() => install(blueprint.slug, { slug: blueprint.slug })}
          />
        ))}
        {published.map((blueprint) => (
          <BlueprintCard
            key={blueprint.id}
            name={blueprint.name}
            summary={blueprint.summary ?? ""}
            meta={
              blueprint.installCount > 0
                ? `${blueprint.category} · installed ${blueprint.installCount}×`
                : blueprint.category
            }
            busy={busy === blueprint.id}
            onInstall={() =>
              install(blueprint.id, { blueprintId: blueprint.id })
            }
          />
        ))}
      </ul>
    </section>
  );
}

function BlueprintCard({
  name,
  summary,
  meta,
  busy,
  onInstall,
}: {
  name: string;
  summary: string;
  meta: string;
  busy: boolean;
  onInstall: () => void;
}) {
  return (
    <li className="flex flex-col gap-3 bg-background p-4">
      <div className="flex-1 space-y-1">
        <p className={SECTION_LABEL}>{meta}</p>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className={cn(BODY_MUTED, "text-xs")}>{summary}</p>
      </div>
      <button
        type="button"
        onClick={onInstall}
        disabled={busy}
        className={cn(GHOST_PILL, "self-start", busy && "opacity-50")}
      >
        {busy ? "Installing…" : "Install"}
      </button>
    </li>
  );
}

/** Publish an existing gadget as a blueprint. Lives on the gadget's own page. */
export function PublishAsBlueprint({ gadgetId }: { gadgetId: string }) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publish = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/helix/blueprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gadgetId }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error ?? "Could not publish.");
      setDone(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not publish.");
    } finally {
      setBusy(false);
    }
  }, [gadgetId]);

  if (done) {
    return (
      <p className={CAPTION}>
        Published. It is on the blueprint shelf for any client — source only, so
        this client&apos;s data stayed here.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => void publish()}
        disabled={busy}
        className={cn(PRIMARY_PILL, busy && "opacity-50")}
      >
        Publish as blueprint
      </button>
      <p className={CAPTION}>
        Copies the source, never the data — other clients get a blank instance.
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
