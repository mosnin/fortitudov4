import 'server-only';
import { db } from '@/db';
import { notifications } from '@/db/schema';

/**
 * Notifying about queued work.
 *
 * Deliberately narrow. The person who just spoke to Helix already sees what it
 * queued, inline, in the thread — notifying them there would be noise, and a
 * notification stream people learn to ignore is worse than none.
 *
 * What survives them closing the tab is the risk worth a notification: a
 * `high` action is one a reviewer must read rather than sweep up in a bulk
 * approval, and it is the only case that fires. Routine changes wait quietly
 * in the queue where they belong.
 */
export async function notifySignificantQueued(
  userId: string,
  threadId: string,
  actions: { summary: string; risk: string }[]
): Promise<void> {
  const significant = actions.filter((action) => action.risk === 'high');
  if (significant.length === 0) return;

  await db.insert(notifications).values({
    userId,
    type: 'helix_approval_needed',
    title:
      significant.length === 1
        ? 'Helix queued something significant'
        : `Helix queued ${significant.length} significant changes`,
    // The summary itself, not a count — a notification that does not say what
    // happened just makes someone open a tab to find out.
    body: significant.map((action) => action.summary).join('\n'),
    actionUrl: `/admin/helix/approvals?thread=${threadId}`,
  });
}
