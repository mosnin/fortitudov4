"use client";

import { Button } from "@/components/ui/button";
import { Download, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

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

/** Invoice status → uppercase-mono text color (fused system semantics). */
const statusTone: Record<InvoiceData["status"], string> = {
  paid: "text-success",
  pending: "text-warning",
  overdue: "text-destructive",
};

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
    <section className="border-t border-border pt-5">
      <div className="flex items-center justify-between">
        <h3 className="micro-label flex items-center gap-1.5">
          <Receipt className="h-3.5 w-3.5" />
          Invoice
        </h3>
        <span
          className={cn(
            "font-mono text-[11px] font-semibold uppercase tracking-[0.08em]",
            statusTone[invoice.status]
          )}
        >
          {invoice.status}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Invoice #</span>
          <span className="font-mono text-xs">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date</span>
          <span className="font-mono text-xs">{invoice.date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Project</span>
          <span>{invoice.projectName}</span>
        </div>
      </div>

      <div className="mt-3 space-y-2 border-t border-border pt-3">
        {invoice.items.map((item, i) => (
          <div key={i} className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{item.description}</span>
            <span className="font-mono">{item.amount}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1.5 border-t border-border pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono">{invoice.subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-mono">{invoice.tax}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span className="font-mono">{invoice.total}</span>
        </div>
      </div>

      <Button variant="outline" className="mt-4 w-full" onClick={handleDownload}>
        <Download className="mr-1 h-4 w-4" />
        Download Invoice
      </Button>
    </section>
  );
}
