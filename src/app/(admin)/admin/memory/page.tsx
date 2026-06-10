import { notFound, redirect } from "next/navigation";
import { getOrCreateCurrentUser } from "@/lib/auth-utils";
import { AsciiField } from "@/components/dashboard/ascii-field";
import { MemoryPanel } from "@/components/dashboard/memory-panel";

export const dynamic = "force-dynamic";

export default async function AdminMemoryPage() {
  const me = await getOrCreateCurrentUser();
  if (!me) redirect("/sign-in");
  if (me.role !== "admin") notFound();

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-charcoal p-6 sm:p-8">
        <AsciiField className="absolute inset-0 h-full w-full opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(249,115,22,0.18),transparent_60%)]" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-orange/80">Memory</p>
          <h1 className="font-brand mt-2 text-3xl text-white sm:text-4xl">
            What the studio <span className="text-gradient-orange">knows</span>
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Compounding agency memory — preferences, patterns, and decisions the agents draw on.
          </p>
        </div>
      </div>

      <MemoryPanel />
    </div>
  );
}
