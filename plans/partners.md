# Partners

Fortitudo does work for other agencies and for affiliates, not only for direct
clients. A partner is a third party who brings work in: sometimes a referral,
more often another agency contracting us to build something their client will
own. They need a way in that is neither the client portal nor the admin.

## Not the thing AGENTS.md banned

AGENTS.md says the swept-out GoHighLevel machinery "must not come back", and
names **"no partner ledger or 50/50 payment splits"** in that list. This is not
that, and the distinction is worth stating because the names collide.

The banned thing was a **revenue-split accounting system** — a ledger that
divided every payment between the agency and a partner on a fixed percentage.
That is gone and stays gone.

What is here is an **account type**: a login, a place to describe work they
want built, and a place for us to answer with a price. No commission, no
payout, no split, no ledger. `kind: 'affiliate'` is a label describing who
someone is, not a mechanism that moves money. If a commission model is ever
wanted it needs its own decision, not a quiet extension of this.

## The fourth surface

There are three today: the marketing site, the client portal (`/dashboard`),
and the agency's admin (`/admin`). Partners are a fourth, at `/partner`, and it
is deliberately its own thing rather than a variant of the client portal.

A client sees one delivery pipeline for the project they bought. A partner sees
a list of jobs at different stages, most of which are for *their* clients, not
theirs — the relationship is wholesale. Bending the client portal to cover both
would put a stage tracker in front of someone who wants a quote and a queue.

`users.role` gains `partner`. It is **not staff** — `isStaff()` must keep
returning false for it, or a partner lands in `/admin`.

## The data

Two tables. Money in integer cents, as everywhere else.

**`partners`** — the organisation.

| column | why |
| --- | --- |
| `companyName`, `contactName`, `email` | who they are |
| `kind` | `affiliate` \| `agency` — a label, not a behaviour |
| `status` | `active` \| `paused` \| `archived` |
| `userId` | their portal login, nullable — a partner exists before their account does, same as `agencyClients` |
| `notes`, `createdBy` | ours |

**`partnerRequests`** — one job.

| column | why |
| --- | --- |
| `partnerId` | owner. Every read is scoped by it |
| `title`, `scope` | what they want built |
| `serviceType` | one of the five offerings. Not a free-text category — the same enum the rest of the system uses |
| `budgetCents` | **what the partner says they have** |
| `quotedCents` | **what we say it costs.** A separate column on purpose |
| `status` | see below |
| `targetDate` | nullable; when they need it |
| `projectId` | set when an accepted request becomes real work |

### Two money columns, and why it is not one

`budgetCents` is the partner's and `quotedCents` is ours. Collapsing them into
one `amount` would let a partner edit the number we are going to invoice
against, which is the same class of mistake the Helix rules already forbid:
*"a client has no authority over their own delivery stage or fees."* A partner
has no authority over their own quote either. They state a budget; we answer
with a price; the two are allowed to differ, and the gap between them is the
negotiation.

### Status

`draft` → `submitted` → `reviewing` → `quoted` → `accepted` \| `declined` → `delivered`

`draft` covers both directions of the same door. A partner saving before they
are ready is a draft; so is the shell **we** create when we want a partner to
fill in scope and budget for something already discussed. One object, either
author — `createdBy` records which.

## Who may do what

- A partner reads **only** rows whose `partnerId` is their own. Not other
  partners, not clients, not leads, not finance, not the CRM.
- A partner may edit `title`, `scope`, `serviceType`, `budgetCents` and
  `targetDate` — and **only while the request is `draft` or `submitted`.** Once
  we are quoting against it, the thing being quoted stops moving.
- A partner may never write `quotedCents`, `projectId`, or any status beyond
  submitting their own draft.
- `admin` and `project_manager` manage partners and requests. VAs do not: a VA
  is scoped to tasks they hold, and a partner request is a commercial document.

The deny cases matter more than the allow cases here and should be tested that
way — a partner reaching another partner's requests is the failure that ends
the relationship.

## Order of work

1. Schema, roles, permissions, post-login routing — everything else depends on
   it, and it is the part where a mistake is an access-control bug rather than
   a layout bug.
2. `/partner` — the partner's own surface.
3. `/admin/partners` — ours.
4. API routes, scoped by the rules above.

A schema change needs `npx drizzle-kit push` against the target database before
it deploys (AGENTS.md). `partners`, `partnerRequests`, the
`partner_request_status` and `partner_kind` enums, and the added `partner` role
are all new.
