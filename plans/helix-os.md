# Helix OS — build plan

An agency operating system. The thesis: every tool on this market (GoHighLevel,
Monday, ClickUp, Basecamp) is a **record-keeping** system. Records are the
residue of work, not the work. Helix OS is a system where the work happens
inside the product and the record writes itself.

Architecture adopted from **cloudflare-os** — the concepts, implemented natively
in Next.js 16 / Drizzle / Neon / Clerk. Their runtime (Workers, Durable Objects,
Dynamic Workers, Cap'n Web, workerd) is not portable to our stack; their
*architecture* is, and it is the valuable part.

## The four primitives

| cloudflare-os | Helix OS | What it is here |
| --- | --- | --- |
| workspace | **Thread** | A durable agent session scoped to work. Holds messages, introductions, actions. |
| gatekeeper | **Gatekeeper** | A typed adapter for one resource kind. Declares read ops and write ops. Every call logged. |
| capability introduction | **Introduction** | A thread starts with access to nothing. A resource must be introduced. Helix may request one; a human grants or denies. |
| gadget / blueprint | **Gadget / Blueprint** | A sandboxed per-client mini-app Helix writes. Blueprint = its shareable source. |

## The crown jewel: deferred approval with simulation

Traditional human-in-the-loop is *synchronous* — the agent stops and waits, so
people set it to auto-approve and it stops being safe. Gatekeepers invert this:

1. Helix calls a **write op**.
2. The gatekeeper does not touch the database. It calls `simulate()`, which
   returns a plausible result and records the intent as a pending **Action**.
3. Helix is told it succeeded and keeps working. Subsequent reads are served
   from the **simulated overlay** so the thread stays internally consistent.
4. Later, a human opens **Approvals** and approves or rejects — in bulk or one
   by one. Approved actions run `execute()` for real. Rejected ones drop from
   the overlay.

This is the whole product in one mechanism: agency speed with agency control.

## Iterations

1. Schema: threads, messages, introductions, actions, gadgets, blueprints, events.
2. Gatekeeper runtime + registry; the op contract (`read` / `write` with `simulate` + `execute`).
3. First gatekeepers: clients, projects, tasks.
4. Agent runtime — pluggable. Anthropic-backed when `ANTHROPIC_API_KEY` is set;
   a deterministic planner otherwise so every flow is demonstrable without a key.
5. Approvals queue UI — the flagship screen.
6. Helix thread UI — chat, introductions rail, inline action cards.
7. Introductions UX — pick or paste a resource; agent-requested grants.
8. More gatekeepers: invoices/payments, messages, files, scheduler, publish.
9. Gadget runtime — sandboxed iframe, strict CSP, scoped RPC bridge.
10. Gadget builder — Helix writes gadget source; versions; live preview.
11. Blueprints — install a gadget into a client workspace.
12. Client-side Helix — restricted to the client's own project.
13. Command palette (⌘K) tying every surface together.
14. Activity / audit stream.
15. Helix surfaced on the existing dashboard pages.
16. Marketing section for the platform; docs; design.md; final verification.

## Rules

- The realestatecrm design system is not negotiable. Every new product surface
  composes from `src/components/crm/`. See `design.md`.
- No new colour. Helix's one affordance is `HELIX_PILL`.
- Money stays integer cents.
- Every write op must have both `simulate()` and `execute()`. A gatekeeper op
  without a simulator cannot be registered — the type system enforces it.
