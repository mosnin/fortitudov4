"use client";

import { RecordList, RecordRow, RowPill } from "@/components/crm";
import { cn } from "@/lib/utils";
import { GHOST_PILL, SECTION_LABEL } from "@/lib/typography";

interface InvoiceItem {
  description: string;
  amount: string;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  status: "paid" | "pending" | "overdue";
  items: InvoiceItem[];
  subtotal: string;
  tax: string;
  total: string;
  projectName: string;
  clientName: string;
}

export function InvoiceCard({ invoice }: { invoice: InvoiceData }) {
  const handleDownload = () => {
    const invoiceContent = `
INVOICE: ${invoice.invoiceNumber}
Date: ${invoice.date}
Client: ${invoice.clientName}
Project: ${invoice.projectName}

${invoice.items.map((i) => `${i.description}: ${i.amount}`).join("\n")}

Subtotal: ${invoice.subtotal}
Tax: ${invoice.tax}
Total: ${invoice.total}

Status: ${invoice.status.toUpperCase()}
    `.trim();

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className={SECTION_LABEL}>Invoice</p>
        {/* Overdue is a genuine semantic; paid/pending stay neutral. */}
        <RowPill
          className={cn(
            invoice.status === "overdue" &&
              "border-destructive/40 text-destructive"
          )}
        >
          {invoice.status}
        </RowPill>
      </div>

      <dl className="divide-y divide-border/60 border-t border-border/60">
        <div className="flex justify-between gap-3 py-3">
          <dt className="text-sm text-muted-foreground">Invoice no.</dt>
          <dd className="text-sm tabular-nums text-foreground">
            {invoice.invoiceNumber}
          </dd>
        </div>
        <div className="flex justify-between gap-3 py-3">
          <dt className="text-sm text-muted-foreground">Date</dt>
          <dd className="text-sm tabular-nums text-foreground">
            {invoice.date}
          </dd>
        </div>
        <div className="flex justify-between gap-3 py-3">
          <dt className="text-sm text-muted-foreground">Project</dt>
          <dd className="truncate text-sm text-foreground">
            {invoice.projectName}
          </dd>
        </div>
      </dl>

      <RecordList className="border-t border-border/60">
        {invoice.items.map((item, i) => (
          <RecordRow
            key={i}
            index={i}
            primary={
              <span className="font-normal text-muted-foreground">
                {item.description}
              </span>
            }
            meta={
              <span className="text-sm tabular-nums text-foreground">
                {item.amount}
              </span>
            }
          />
        ))}
      </RecordList>

      <div className="space-y-2 border-t border-border/60 pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums text-foreground">
            {invoice.subtotal}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span className="tabular-nums text-foreground">{invoice.tax}</span>
        </div>
        <div className="flex justify-between text-sm font-medium">
          <span className="text-foreground">Total</span>
          <span className="tabular-nums text-foreground">{invoice.total}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className={cn(GHOST_PILL, "w-full cursor-pointer justify-center")}
      >
        Download invoice
      </button>
    </section>
  );
}
