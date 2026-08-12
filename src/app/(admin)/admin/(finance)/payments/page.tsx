"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DateRangePill,
  ALL_TIME,
  inRange,
  type DateRange,
} from "@/components/ui/filters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClientPaymentModal,
  type EditablePayment,
} from "@/components/admin/client-payment-modal";
import { TrendCard } from "@/components/ui/monthly-trend";
import {
  CrmPageHeader,
  StatStrip,
  StatCell,
  Stat,
  StatEmpty,
  StatMeta,
  TabStrip,
  Toolbar,
  ToolbarSearch,
  ToolbarActions,
  FilterSelect,
  RecordList,
  RecordRow,
  RowPill,
  RowAction,
  RecordListSkeleton,
  SectionHead,
} from "@/components/crm";
import { AnimatedNumber } from "@/components/motion";
import {
  PAGE_RHYTHM,
  READING_COL,
  SECTION_RHYTHM,
  CAPTION,
  PRIMARY_PILL,
  GHOST_PILL,
} from "@/lib/typography";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  companyName: string | null;
  contactName: string | null;
  paymentType: "setup_fee" | "monthly_retainer";
  method: string;
  amount: number;
  paidAt: string;
  notes: string | null;
}

const usd = (cents: number) =>
  `$${Math.round(cents / 100).toLocaleString("en-US")}`;

const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

export default function AdminPaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EditablePayment | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [range, setRange] = useState<DateRange>(ALL_TIME);
  const [sort, setSort] = useState("date_desc");

  const load = useCallback(() => {
    fetch("/api/admin/client-payments")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.payments)) {
          setTransactions(data.payments);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  async function remove(t: Transaction) {
    if (
      !window.confirm(
        `Delete this ${usd(t.amount)} payment from ${t.contactName ?? t.companyName ?? "client"}?`
      )
    )
      return;
    await fetch(`/api/admin/client-payments/${t.id}`, { method: "DELETE" });
    load();
  }

  // Search + date range scope everything below the strip; the type tabs are
  // page state on top of that scope, which is why they carry the counts.
  const scoped = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (!inRange(t.paidAt, range)) return false;
      if (q) {
        const hay = [t.contactName, t.companyName, t.method, t.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, search, range]);

  const filtered = useMemo(() => {
    const rows = scoped.filter(
      (t) => typeFilter === "all" || t.paymentType === typeFilter
    );
    const dir = sort.endsWith("_asc") ? 1 : -1;
    rows.sort((a, b) =>
      sort.startsWith("amount")
        ? (a.amount - b.amount) * dir
        : (new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime()) * dir
    );
    return rows;
  }, [scoped, typeFilter, sort]);

  const filtersActive =
    search.trim() !== "" || typeFilter !== "all" || range.preset !== "all";
  const filteredTotal = filtered.reduce((s, t) => s + t.amount, 0);

  const now = new Date();
  const totalCollected = transactions.reduce((s, t) => s + t.amount, 0);
  const thisMonth = transactions
    .filter((t) => {
      const d = new Date(t.paidAt);
      return (
        d.getUTCFullYear() === now.getUTCFullYear() &&
        d.getUTCMonth() === now.getUTCMonth()
      );
    })
    .reduce((s, t) => s + t.amount, 0);
  // Retainers are the recurring half of revenue — worth its own cell beside
  // the raw totals so setup-fee spikes don't read as recurring growth.
  const retainerCollected = transactions
    .filter((t) => t.paymentType === "monthly_retainer")
    .reduce((s, t) => s + t.amount, 0);

  const clientCount = new Set(
    transactions.map((t) => t.companyName ?? t.contactName ?? "—")
  ).size;

  const subtitle = loading
    ? "Reading the payment ledger…"
    : transactions.length === 0
      ? "Nothing collected yet."
      : `${usd(totalCollected)} collected across ${clientCount} client${
          clientCount === 1 ? "" : "s"
        }.`;

  const tabs = [
    { key: "all", label: "All payments", count: scoped.length },
    {
      key: "setup_fee",
      label: "Setup fees",
      count: scoped.filter((t) => t.paymentType === "setup_fee").length,
    },
    {
      key: "monthly_retainer",
      label: "Retainers",
      count: scoped.filter((t) => t.paymentType === "monthly_retainer").length,
    },
  ];

  return (
    <div className={cn(PAGE_RHYTHM, READING_COL, "pb-12")}>
      <CrmPageHeader
        section="Finance."
        title="Payments"
        subtitle={subtitle}
        action={
          <>
            <Link href="/admin/clients" className={GHOST_PILL}>
              Client roster
            </Link>
            <button
              type="button"
              className={cn(PRIMARY_PILL, "cursor-pointer")}
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Add payment
            </button>
          </>
        }
      />

      {!loading && transactions.length > 0 && (
        <TabStrip
          tabs={tabs}
          active={typeFilter}
          onChange={setTypeFilter}
          ariaLabel="Payment type"
        />
      )}

      {/* Collections at a glance — global, not filtered. */}
      <StatStrip columns={3} ariaLabel="Collections summary">
        {loading ? (
          <>
            <StatCell label="Total collected">
              <Skeleton className="h-8 w-24" />
            </StatCell>
            <StatCell label="This month">
              <Skeleton className="h-8 w-24" />
            </StatCell>
            <StatCell label="Retainer revenue">
              <Skeleton className="h-8 w-24" />
            </StatCell>
          </>
        ) : (
          <>
            <StatCell label="Total collected">
              {totalCollected === 0 ? (
                <StatEmpty>Nothing collected yet.</StatEmpty>
              ) : (
                <>
                  <Stat suffix="collected">
                    <AnimatedNumber value={totalCollected} format={usd} />
                  </Stat>
                  <StatMeta>
                    All time · {transactions.length} payment
                    {transactions.length === 1 ? "" : "s"}
                  </StatMeta>
                </>
              )}
            </StatCell>
            <StatCell label="This month">
              {thisMonth === 0 ? (
                <StatEmpty>Nothing collected this month.</StatEmpty>
              ) : (
                <>
                  <Stat suffix="collected">
                    <AnimatedNumber value={thisMonth} format={usd} />
                  </Stat>
                  <StatMeta>
                    {now.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </StatMeta>
                </>
              )}
            </StatCell>
            <StatCell label="Retainer revenue">
              {retainerCollected === 0 ? (
                <StatEmpty>No retainers recorded yet.</StatEmpty>
              ) : (
                <>
                  <Stat suffix="recurring">
                    <AnimatedNumber value={retainerCollected} format={usd} />
                  </Stat>
                  <StatMeta>All time · monthly retainers</StatMeta>
                </>
              )}
            </StatCell>
          </>
        )}
      </StatStrip>

      {/* One filter row — search left, sort and range right. Drives the trends
          and the payment history below. */}
      {!loading && transactions.length > 0 && (
        <div className={SECTION_RHYTHM}>
          <Toolbar>
            <ToolbarSearch
              value={search}
              onChange={setSearch}
              placeholder="Search client, method, notes…"
            />
            <ToolbarActions>
              <FilterSelect
                label="Sort"
                value={sort}
                onChange={setSort}
                options={[
                  { value: "date_desc", label: "Newest first" },
                  { value: "date_asc", label: "Oldest first" },
                  { value: "amount_desc", label: "Amount: high → low" },
                  { value: "amount_asc", label: "Amount: low → high" },
                ]}
              />
              <DateRangePill value={range} onChange={setRange} />
            </ToolbarActions>
          </Toolbar>
          {filtersActive && (
            <p className={cn(CAPTION, "tabular-nums")}>
              {filtered.length} of {transactions.length} payments ·{" "}
              {usd(filteredTotal)} collected
            </p>
          )}
        </div>
      )}

      {/* Trends — monthly collections + volume */}
      {!loading && filtered.length > 0 && (
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <TrendCard
            title="Collections"
            points={filtered.map((t) => ({
              date: t.paidAt,
              value: t.amount,
            }))}
            format={usd}
          />
          <TrendCard
            title="Payments Recorded"
            points={filtered.map((t) => ({ date: t.paidAt, value: 1 }))}
            format={(v) => Math.round(v).toLocaleString("en-US")}
          />
        </section>
      )}

      <section className={SECTION_RHYTHM}>
        <SectionHead title="Payment History" />
        {loading ? (
          <RecordListSkeleton rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filtersActive ? "No matching payments" : "No payments yet"}
            description={
              filtersActive
                ? "No payments match the current filters — widen the date range or clear the search."
                : "Record payments against roster clients — each one feeds the agency revenue metrics automatically."
            }
          />
        ) : (
          <RecordList>
            {filtered.map((t, i) => (
              <RecordRow
                key={t.id}
                index={i}
                primary={t.contactName ?? t.companyName ?? "Unnamed client"}
                status={
                  <RowPill>
                    {t.paymentType === "setup_fee" ? "SETUP" : "RETAINER"}
                  </RowPill>
                }
                secondary={[t.method, day(t.paidAt), t.notes]
                  .filter(Boolean)
                  .join(" · ")}
                meta={
                  <span className="text-sm tabular-nums text-foreground">
                    {usd(t.amount)}
                  </span>
                }
                actions={
                  <>
                    <RowAction
                      label="Edit payment"
                      onClick={() => {
                        setEditing({
                          id: t.id,
                          paidAt: t.paidAt,
                          paymentType: t.paymentType,
                          method: t.method,
                          amount: t.amount,
                          notes: t.notes,
                        });
                        setModalOpen(true);
                      }}
                    >
                      <Pencil size={13} />
                    </RowAction>
                    <RowAction
                      label="Delete payment"
                      destructive
                      onClick={() => remove(t)}
                    >
                      <Trash2 size={13} />
                    </RowAction>
                  </>
                }
              />
            ))}
          </RecordList>
        )}
      </section>

      <ClientPaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        payment={editing}
      />
    </div>
  );
}
