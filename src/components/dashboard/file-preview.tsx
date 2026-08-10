"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, X } from "lucide-react";
import { RecordRow, RowAction, RowPill } from "@/components/crm";
import { cn } from "@/lib/utils";
import { QUIET_LINK } from "@/lib/typography";

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

/** Category → the WORD, in a neutral pill (design.md: no type icons). */
const CATEGORY_LABELS = {
  image: "Image",
  pdf: "PDF",
  svg: "SVG",
  other: "File",
} as const;

/**
 * One uploaded file, rendered as a kit `RecordRow`. Mount inside a
 * `<RecordList>`: this renders the row's `<li>`.
 */
export function FilePreviewCard({ name, url, type, size }: FilePreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const category = getFileCategory(name, type);
  const canPreview = category === "image" || category === "pdf";

  // Mirrors the original `<a download>`: same request, same filename hint.
  const download = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  return (
    <RecordRow
      primary={
        canPreview ? (
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="cursor-pointer truncate text-left transition-colors hover:text-muted-foreground"
          >
            {name}
          </button>
        ) : (
          name
        )
      }
      status={<RowPill>{CATEGORY_LABELS[category]}</RowPill>}
      secondary={size ? <span className="tabular-nums">{size}</span> : undefined}
      meta={
        <>
          {/* The row actions only fade in on large screens — keep a reachable
              download on narrow ones. */}
          <a
            href={url}
            download={name}
            className={cn(QUIET_LINK, "text-xs lg:hidden")}
          >
            Download
          </a>
          {previewOpen && (
          /* Full preview overlay — fixed to the viewport, so its position in
             the row's DOM is immaterial. */
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setPreviewOpen(false)}
            />
            <div className="relative max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <p className="truncate text-sm font-medium">{name}</p>
                <div className="flex shrink-0 items-center gap-3">
                  <a href={url} download={name} className={cn(QUIET_LINK, "text-xs")}>
                    Download
                  </a>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-muted"
                    aria-label="Close preview"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex max-h-[calc(85vh-56px)] items-center justify-center overflow-auto p-4">
                {category === "image" ? (
                  <Image
                    src={url}
                    alt={name}
                    width={1200}
                    height={800}
                    className="h-auto max-w-full rounded-lg"
                    style={{ maxHeight: "calc(85vh - 100px)" }}
                  />
                ) : category === "pdf" ? (
                  <iframe
                    src={url}
                    className="h-[calc(85vh-100px)] w-full rounded-lg"
                    title={name}
                  />
                ) : null}
              </div>
            </div>
          </div>
          )}
        </>
      }
      actions={
        <RowAction label="Download" onClick={download}>
          <Download size={14} />
        </RowAction>
      }
    />
  );
}
