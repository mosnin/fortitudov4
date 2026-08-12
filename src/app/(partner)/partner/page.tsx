import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { CrmPageHeader } from "@/components/crm";
import { EmptyState } from "@/components/ui/empty-state";
import { RequestList } from "@/components/partner/request-list";
import { toRequestView } from "@/components/partner/request-view";
import { db } from "@/db";
import { partnerRequests } from "@/db/schema";
import { PAGE_RHYTHM, PRIMARY_PILL, READING_COL } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { requirePartnerAccess } from "../access";

/**
 * The partner's queue. The list IS the page.
 *
 * The one query on it is scoped by `partnerId`, and that id comes from
 * `requirePartnerAccess` — the partners row whose userId is this login. There
 * is no code path here that reads an id from the URL, a search param or a
 * cookie, so there is no code path that can be pointed at another partner.
 */
export default async function PartnerRequestsPage() {
  const { partner } = await requirePartnerAccess();

  if (!partner) {
    return (
      <div className={cn(PAGE_RHYTHM, "pb-12")}>
        <div className={cn(READING_COL, PAGE_RHYTHM)}>
          <CrmPageHeader
            section="Partner."
            title="Requests"
            subtitle="Your login isn't attached to a partner account yet."
          />
          <EmptyState
            className="border-t border-border/60"
            title="Nothing to show yet"
            description="We haven't linked this login to your company. Tell us and we'll sort it — until then there's nothing here to read or start."
          />
        </div>
      </div>
    );
  }

  const rows = await db
    .select()
    .from(partnerRequests)
    .where(eq(partnerRequests.partnerId, partner.id))
    .orderBy(desc(partnerRequests.updatedAt));

  const requests = rows.map(toRequestView);

  return (
    <div className={cn(PAGE_RHYTHM, "pb-12")}>
      <div className={cn(READING_COL, PAGE_RHYTHM)}>
        <CrmPageHeader
          section="Partner."
          title="Requests"
          subtitle={statusSentence(requests)}
          action={
            <Link href="/partner/requests/new" className={PRIMARY_PILL}>
              New request
            </Link>
          }
        />
        <RequestList requests={requests} />
      </div>
    </div>
  );
}

/** One sentence of status — where the queue actually stands right now. */
function statusSentence(
  requests: { status: string }[]
): string {
  if (requests.length === 0) {
    return "Nothing here yet — start a request when you're ready.";
  }
  const count = requests.length;
  const head = count === 1 ? "One request" : `${count} requests`;
  const quoted = requests.filter((r) => r.status === "quoted").length;
  if (quoted > 0) {
    return `${head}, ${quoted} waiting on your word.`;
  }
  const withUs = requests.filter(
    (r) => r.status === "submitted" || r.status === "reviewing"
  ).length;
  if (withUs > 0) {
    return `${head}, ${withUs} with us.`;
  }
  const drafts = requests.filter((r) => r.status === "draft").length;
  if (drafts > 0) {
    return `${head}, ${drafts} still a draft.`;
  }
  return `${head}, nothing open.`;
}
