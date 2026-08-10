/**
 * The files gatekeeper — deliverables and assets on a project.
 *
 * Read-only, deliberately. Helix has nothing to upload from: files arrive
 * through the browser via UploadThing, and an op that could delete or rename
 * a client's deliverable would add real risk for no capability anyone asked
 * for. When there is a genuine reason to write here, it gets a simulator and
 * a preview like everything else.
 */

import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { files, projects } from '@/db/schema';
import {
  defineGatekeeper,
  readOp,
  type ResourceRef,
} from '../contract';

const FILE_FIELDS = {
  id: files.id,
  projectId: files.projectId,
  name: files.name,
  url: files.url,
  size: files.size,
  type: files.type,
  createdAt: files.createdAt,
};

const listFiles = readOp<{ projectId: string }, unknown>({
  name: 'listProjectFiles',
  description:
    'Files attached to a project — deliverables, assets, references — newest first. Sizes are in bytes.',
  resourceKind: 'file',
  guard: { kind: 'project', field: 'projectId' },
  scopeMode: 'resource',
  input: z.object({ projectId: z.string().uuid() }),
  async run(input) {
    return db
      .select(FILE_FIELDS)
      .from(files)
      .where(eq(files.projectId, input.projectId))
      .orderBy(desc(files.createdAt));
  },
});

export const filesGatekeeper = defineGatekeeper({
  name: 'files',
  resourceKind: 'file',
  label: 'Files',
  description: 'Deliverables and assets attached to each project. Read-only.',
  ops: { listProjectFiles: listFiles } as never,
  async resolve(id) {
    const [row] = await db
      .select({
        id: files.id,
        name: files.name,
        project: projects.name,
      })
      .from(files)
      .innerJoin(projects, eq(files.projectId, projects.id))
      .where(eq(files.id, id))
      .limit(1);
    if (!row) return null;
    return {
      kind: 'file',
      id: row.id,
      label: row.name,
      detail: row.project,
    } satisfies ResourceRef;
  },
  // Reached by introducing the project the file hangs off.
  async search() {
    return [];
  },
});
