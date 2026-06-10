import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { db } from "@/db";
import { files } from "@/db/schema";
import { getOrCreateCurrentUser, verifyProjectAccess } from "@/lib/auth-utils";

const f = createUploadthing();

// Uploads attach to a project; auth + access are checked in middleware, and the
// file row is recorded once the upload completes.
export const ourFileRouter = {
  projectFile: f({ blob: { maxFileSize: "32MB", maxFileCount: 10 } })
    .input(z.object({ projectId: z.string().uuid() }))
    .middleware(async ({ input }) => {
      const user = await getOrCreateCurrentUser();
      if (!user) throw new UploadThingError("Unauthorized");
      await verifyProjectAccess(input.projectId, user.id, user.role);
      return { userId: user.id, projectId: input.projectId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = (file as { ufsUrl?: string }).ufsUrl ?? file.url;
      await db.insert(files).values({
        projectId: metadata.projectId,
        uploadedBy: metadata.userId,
        name: file.name,
        url,
        size: file.size,
        type: file.type,
      });
      return { url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
