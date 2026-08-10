"use client";

/**
 * The host side of the gadget bridge.
 *
 * The gadget is on an opaque origin, so `event.origin` is the string "null"
 * and is worth nothing as an identity check. The check that matters is
 * `event.source === iframe.contentWindow`: it proves the message came from
 * this frame and not from any other window that happens to know the protocol.
 *
 * Every request is answered by the server, never from state the host already
 * holds — the gadget's reach is exactly what the API allows it, and the host
 * is a courier rather than a second source of truth.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildGadgetDocument,
  GADGET_SANDBOX,
  type GadgetSource,
} from "@/lib/helix/gadgets/document";
import { CAPTION } from "@/lib/typography";
import { cn } from "@/lib/utils";

interface BridgeMessage {
  source: "helix-gadget";
  id?: number;
  kind: "getState" | "setState" | "read" | "resize" | "error";
  payload?: unknown;
}

export function GadgetFrame({
  gadgetId,
  source,
  title,
  className,
}: {
  gadgetId: string;
  source: GadgetSource;
  title: string;
  className?: string;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(320);
  const [failure, setFailure] = useState<string | null>(null);

  const reply = useCallback(
    (id: number | undefined, result: unknown, error?: string) => {
      if (id === undefined) return;
      frameRef.current?.contentWindow?.postMessage(
        { source: "helix-host", id, result, error },
        // The frame has an opaque origin, so "*" is the only deliverable
        // target. Safe here because the payload is data this gadget is already
        // entitled to and the frame cannot forward it anywhere.
        "*"
      );
    },
    []
  );

  useEffect(() => {
    const onMessage = async (event: MessageEvent<BridgeMessage>) => {
      const frame = frameRef.current;
      if (!frame || event.source !== frame.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== "helix-gadget") return;

      if (data.kind === "resize") {
        const next = Number(data.payload);
        if (Number.isFinite(next)) {
          setHeight(Math.min(Math.max(next + 8, 120), 2000));
        }
        return;
      }

      if (data.kind === "error") {
        setFailure(String(data.payload));
        return;
      }

      try {
        const response = await fetch(`/api/helix/gadgets/${gadgetId}/rpc`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: data.kind, payload: data.payload }),
        });
        const body = await response.json();
        if (!response.ok) {
          reply(data.id, undefined, body?.error ?? "That call was refused.");
          return;
        }
        reply(data.id, body.result);
      } catch {
        reply(data.id, undefined, "That call could not be completed.");
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [gadgetId, reply]);

  return (
    <div className={cn("space-y-2", className)}>
      <iframe
        ref={frameRef}
        title={title}
        // No allow-same-origin: the gadget gets an opaque origin, so it cannot
        // reach this document, its cookies, or its storage.
        sandbox={GADGET_SANDBOX}
        srcDoc={buildGadgetDocument(source)}
        style={{ height }}
        className="w-full rounded-lg border border-border/60 bg-background"
      />
      {failure && (
        <p className={cn(CAPTION, "text-destructive")}>
          This gadget hit an error: {failure}
        </p>
      )}
    </div>
  );
}
