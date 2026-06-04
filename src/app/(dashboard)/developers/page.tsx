import { AsciiField } from "@/components/dashboard/ascii-field";
import { Reveal } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

const endpoints: { method: string; path: string; desc: string }[] = [
  { method: "GET", path: "/api/agent/catalog", desc: "Browse productized starting points by discipline." },
  { method: "POST", path: "/api/agent/briefs", desc: "Submit a structured brief; receive a Blueprint with scope + price." },
  { method: "POST", path: "/api/agent/blueprints/{id}/accept", desc: "Accept a Blueprint and start the build (returns checkout)." },
  { method: "GET", path: "/api/agent/projects/{id}", desc: "Read a project's status, phases, decisions, and deliverables." },
  { method: "GET", path: "/api/agent/decisions", desc: "List open decisions awaiting a response." },
  { method: "POST", path: "/api/agent/decisions/{id}/answer", desc: "Answer a decision to unblock the build." },
];

const methodTone: Record<string, string> = {
  GET: "text-success",
  POST: "text-orange",
};

export default function DevelopersPage() {
  return (
    <div className="space-y-5">
      <Reveal className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-7 sm:p-9">
        <AsciiField className="absolute inset-0 h-full w-full opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Developers</p>
          <h1 className="font-brand mt-2 text-3xl text-white sm:text-4xl">The Agent API</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/65 sm:text-base">
            Agents are first-class principals at Fortitudo — they brief, buy, and steer builds through
            the same core as humans. Mint a key in Settings and drive the studio programmatically.
          </p>
        </div>
      </Reveal>

      {/* Auth */}
      <section className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Authentication</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Create a key in <span className="text-foreground">Settings → API keys</span>, then send it as a
          bearer token on every request:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-border/60 bg-background/60 p-4 font-mono text-xs leading-relaxed">
{`curl https://fortitudo.agency/api/agent/catalog \\
  -H "Authorization: Bearer ftd_live_xxxxxxxxxxxx"`}
        </pre>
      </section>

      {/* Endpoints */}
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl">
        <div className="px-6 pt-5">
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">Endpoints</h2>
        </div>
        <div className="mt-3 divide-y divide-border/40">
          {endpoints.map((e) => (
            <div key={e.path} className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-3 sm:w-1/2">
                <span className={`w-12 shrink-0 font-mono text-xs font-semibold ${methodTone[e.method]}`}>
                  {e.method}
                </span>
                <code className="truncate font-mono text-sm">{e.path}</code>
              </div>
              <p className="text-sm text-muted-foreground sm:w-1/2">{e.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MCP */}
      <section className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-orange/80">
          MCP — work tasks with Claude
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Connect Claude (Desktop or cowork) to the studio over the Model Context Protocol. Claude can
          see ready tasks in dependency order, claim them, and submit work — every submission waits for
          a human admin to approve or request changes. Add this server with your API key as the bearer token:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-border/60 bg-background/60 p-4 font-mono text-xs leading-relaxed">
{`MCP URL:  https://fortitudo.agency/api/mcp
Header:   Authorization: Bearer ftd_live_xxxxxxxxxxxx`}
        </pre>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            ["list_projects", "Builds you can access."],
            ["list_tasks", "Actionable tasks (scope 'ready' = workable now), in dependency order."],
            ["get_task", "Full context: acceptance criteria, phase, Blueprint, blockers, prior reviews."],
            ["claim_task", "Assign to yourself + move to in_progress (if ready)."],
            ["submit_task", "Submit work → in_review (human approves/revises)."],
          ].map(([name, desc]) => (
            <div key={name} className="rounded-2xl border border-border/40 bg-background/40 px-4 py-3">
              <code className="font-mono text-sm text-orange">{name}</code>
              <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="px-1 text-xs text-muted-foreground">
        Keys are scoped to your account; revoke any key anytime in Settings. Requests are rate-limited.
      </p>
    </div>
  );
}
