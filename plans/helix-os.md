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

## Iterations — all shipped

1. ✅ Schema: threads, messages, introductions, actions, gadgets, blueprints, events.
2. ✅ Gatekeeper runtime + registry; the op contract.
3. ✅ First gatekeepers: clients, projects, tasks.
4. ✅ Agent runtime — pluggable (Anthropic / rule-based planner).
5. ✅ Approvals queue.
6. ✅ Thread UI with the introductions rail.
7. ✅ Introductions UX, including agent-requested grants.
8. ✅ Money, conversations, files and reports gatekeepers.
9. ✅ Gadget runtime — sandboxed iframe, CSP, scoped RPC bridge.
10. ✅ Gadget builder + version history.
11. ✅ Blueprints, with three built-ins.
12. ✅ Client-side Helix — read-only by construction.
13. ✅ Command palette.
14. ✅ Activity stream.
15. ✅ Helix surfaced on existing pages.
16. ✅ Marketing section, docs, design.md, verification.

## What is not built

Stated plainly so nobody assumes otherwise:

- **No integration tests.** `pnpm test` covers the pure logic the invariants
  live in — the overlay, the registry contract, the sandbox document — and each
  assertion was verified to fail against a deliberately broken version. Nothing
  covers a real request against Postgres; that needs a database harness this
  repo does not have, and mocking one would only test the mock.
- **No component tests.** The React surfaces are unverified beyond typecheck
  and build.
- **No scheduler.** Helix acts when asked. There is no cron, no watcher, no
  "Helix noticed X overnight".
- **No streaming.** A turn returns once its actions are persisted; see the
  reasoning in `threads/[id]/messages/route.ts`.
- **Reads are logged but never rate-limited.** A long agent turn can write a
  lot of audit rows.

## Rules

- The realestatecrm design system is not negotiable. Every new product surface
  composes from `src/components/crm/`. See `design.md`.
- No new colour. Helix's one affordance is `HELIX_PILL`.
- Money stays integer cents.
- Every write op must have both `simulate()` and `execute()`. A gatekeeper op
  without a simulator cannot be registered — the type system enforces it.
