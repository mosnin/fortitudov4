"use client";

import { useRouter } from "next/navigation";
import { UploadButton } from "@/lib/uploadthing";

/** Attach files to a project (brand assets, briefs, etc.). Requires UPLOADTHING_TOKEN. */
export function FileUpload({ projectId }: { projectId: string }) {
  const router = useRouter();
  return (
    <UploadButton
      endpoint="projectFile"
      input={{ projectId }}
      onClientUploadComplete={() => router.refresh()}
      appearance={{
        button:
          "ut-ready:bg-orange ut-uploading:bg-orange/70 rounded-full bg-orange px-4 text-sm font-semibold text-white after:bg-orange-dark",
        allowedContent: "text-xs text-muted-foreground",
      }}
      content={{ button: "Upload files" }}
    />
  );
}
