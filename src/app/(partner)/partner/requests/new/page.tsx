import { CrmPageHeader } from "@/components/crm";
import { EmptyState } from "@/components/ui/empty-state";
import { NewRequest } from "@/components/partner/new-request";
import { PAGE_RHYTHM, READING_COL } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { requirePartnerAccess } from "../../../access";

/**
 * Start a request.
 *
 * The gate runs here in its own right — this page is reachable directly and by
 * a client navigation from the list, and the layout's check does not re-run on
 * the second of those.
 */
export default async function NewPartnerRequestPage() {
  const { partner } = await requirePartnerAccess();

  if (!partner) {
    return (
      <div className={cn(PAGE_RHYTHM, "pb-12")}>
        <div className={cn(READING_COL, PAGE_RHYTHM)}>
          <CrmPageHeader
            section="Request."
            title="New request"
            subtitle="Your login isn't attached to a partner account yet."
          />
          <EmptyState
            className="border-t border-border/60"
            title="You can't start a request yet"
            description="We haven't linked this login to your company. Tell us and we'll sort it."
          />
        </div>
      </div>
    );
  }

  return <NewRequest />;
}
