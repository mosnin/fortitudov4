"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SECTION_LABEL, STATUS_PILL } from "@/lib/typography";

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
        <span
          className={cn(
            STATUS_PILL,
            invoice.status === "overdue" &&
              "border-destructive/40 text-destructive"
          )}
        >
          {invoice.status}
        </span>
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

      <ul className="divide-y divide-border/60 border-t border-border/60">
        {invoice.items.map((item, i) => (
          <li key={i} className="flex justify-between gap-3 py-3">
            <span className="min-w-0 truncate text-sm text-muted-foreground">
              {item.description}
            </span>
            <span className="shrink-0 text-sm tabular-nums text-foreground">
              {item.amount}
            </span>
          </li>
        ))}
      </ul>

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

      <Button variant="outline" className="w-full" onClick={handleDownload}>
        Download invoice
      </Button>
    </section>
  );
}
