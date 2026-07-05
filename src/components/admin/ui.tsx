import { ReactNode } from "react";

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-5">
      <p className="text-sm text-ink/50">{label}</p>
      <p className="mt-1 font-serif text-2xl text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/40">{hint}</p>}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600",
  PAID: "bg-blue-50 text-blue-600",
  PROCESSING: "bg-blue-50 text-blue-600",
  SHIPPED: "bg-purple-50 text-purple-600",
  DELIVERED: "bg-green-50 text-green-600",
  CANCELLED: "bg-red-50 text-red-600",
  REFUNDED: "bg-red-50 text-red-600",
  ACTIVE: "bg-green-50 text-green-600",
  DRAFT: "bg-ink/5 text-ink/50",
  ARCHIVED: "bg-ink/5 text-ink/50",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status] ?? "bg-ink/5 text-ink/50"}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-ink/15 bg-white py-16 text-center">
      <h3 className="mb-1 font-serif text-lg text-ink">{title}</h3>
      {hint && <p className="mb-5 text-sm text-ink/50">{hint}</p>}
      {action}
    </div>
  );
}