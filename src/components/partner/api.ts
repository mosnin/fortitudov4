/**
 * The two writes this surface makes, against the partner-request API:
 *
 *   POST   /api/partner-requests          create
 *   PATCH  /api/partner-requests/[id]     update
 *
 * Both take JSON and answer with the row on success or `{ error: string }` on
 * failure. That `error` is written for the person reading it, so it is what
 * gets shown — never swapped for a house "Something went wrong". A form that
 * hides the server's reason is a form that teaches people to retry blindly.
 *
 * Nothing here reports success it did not see: `ok` is set from the response,
 * never from having sent the request.
 *
 * The payload is the partner half of the contract and nothing more. There is
 * no `quotedCents`, no `projectId`, no `partnerId` — the routes refuse all
 * three with a 403 before validating anything else, and the surface that sends
 * them should not know how to name them.
 */

export interface RequestPayload {
  title?: string;
  scope?: string | null;
  serviceType?: string;
  /** Integer cents, as everywhere else. Null clears it. */
  budgetCents?: number | null;
  /** `yyyy-mm-dd` or a full ISO instant; null clears it. */
  targetDate?: string | null;
  /**
   * The one status move a partner may make: their own draft → submitted.
   * Accepted on create (open it already sent) and on update (send it later);
   * every other value is refused by `canPartnerSubmitRequest` server-side.
   */
  status?: "submitted";
}

export type SaveResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string };

const NETWORK_ERROR =
  "We couldn't reach the server. Check your connection and try again.";
const UNKNOWN_ERROR = "That didn't save. Try again.";

/** Pull the row id out of the response without assuming a wrapper shape. */
function readId(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const body = payload as Record<string, unknown>;
  if (typeof body.id === "string") return body.id;
  const nested = body.request;
  if (typeof nested === "object" && nested !== null) {
    const id = (nested as Record<string, unknown>).id;
    if (typeof id === "string") return id;
  }
  return null;
}

function readError(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const error = (payload as Record<string, unknown>).error;
  return typeof error === "string" && error.trim() ? error : null;
}

async function send(
  url: string,
  method: "POST" | "PATCH",
  body: RequestPayload
): Promise<SaveResult> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    return { ok: false, error: readError(payload) ?? UNKNOWN_ERROR };
  }

  return { ok: true, id: readId(payload) };
}

export function createRequest(body: RequestPayload): Promise<SaveResult> {
  return send("/api/partner-requests", "POST", body);
}

export function updateRequest(
  id: string,
  body: RequestPayload
): Promise<SaveResult> {
  return send(`/api/partner-requests/${id}`, "PATCH", body);
}
