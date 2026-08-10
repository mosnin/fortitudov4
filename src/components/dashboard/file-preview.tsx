"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUIET_LINK, STATUS_PILL } from "@/lib/typography";

interface FilePreviewProps {
  name: string;
  url: string;
  type?: string;
  size?: string;
}

function getFileCategory(name: string, type?: string): "image" | "pdf" | "svg" | "other" {
  const ext = name.split(".").pop()?.toLowerCase();
  // SVG files can contain embedded scripts — never render them inline.
  if (ext === "svg" || type === "image/svg+xml") {
    return "svg";
  }
  if (type?.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) {
    return "image";
  }
  if (type === "application/pdf" || ext === "pdf") {
    return "pdf";
  }
  return "other";
}

/** Category → the WORD, in a neutral pill (design-product.md: no type icons). */
const CATEGORY_LABELS = {
  image: "Image",
  pdf: "PDF",
  svg: "SVG",
  other: "File",
} as const;

export function FilePreviewCard({ name, url, type, size }: FilePreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const category = getFileCategory(name, type);
  const canPreview = category === "image" || category === "pdf";

  return (
    <>
      <div
        className={cn(
          "group/row -mx-2 flex items-start gap-3 rounded-md px-2 py-3 transition-colors",
          canPreview && "cursor-pointer hover:bg-muted/30"
        )}
        onClick={() => canPreview && setPreviewOpen(true)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">
              {name}
            </span>
            <span className={STATUS_PILL}>{CATEGORY_LABELS[category]}</span>
          </div>
          {size && (
            <div className="mt-0.5 text-xs tabular-nums text-muted-foreground">
              {size}
            </div>
          )}
        </div>
        <a
          href={url}
          download={name}
          onClick={(e) => e.stopPropagation()}
          className={cn(QUIET_LINK, "shrink-0 text-xs")}
        >
          Download
        </a>
      </div>

      {/* Full preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} />
          <div className="relative w-full max-w-4xl max-h-[85vh] rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-fade-in">
            {/* Preview header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
              <p className="truncate text-sm font-medium">{name}</p>
              <div className="flex shrink-0 items-center gap-3">
                <a href={url} download={name} className={cn(QUIET_LINK, "text-xs")}>
                  Download
                </a>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted cursor-pointer"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Preview content */}
            <div className="overflow-auto max-h-[calc(85vh-56px)] flex items-center justify-center p-4">
              {category === "image" ? (
                <Image
                  src={url}
                  alt={name}
                  width={1200}
                  height={800}
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: "calc(85vh - 100px)" }}
                />
              ) : category === "pdf" ? (
                <iframe
                  src={url}
                  className="w-full h-[calc(85vh-100px)] rounded-lg"
                  title={name}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
