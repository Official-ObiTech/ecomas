import { ReactNode } from "react";
import { AdminLayout } from "./AdminLayout";
import { useRequireAdmin } from "@/features/admin/useRequireAdmin";

export function AdminPage({ title, children }: { title?: string; children: ReactNode }) {
  const { isAdmin, loading } = useRequireAdmin();

  if (loading || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-subtle">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      </div>
    );
  }

  return <AdminLayout title={title}>{children}</AdminLayout>;
}