import { AdminPage } from "@/components/admin/AdminGuard";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export default function AdminCollections() {
  return (
    <AdminPage title="Collections">
      <TaxonomyManager basePath="/api/admin/collections" singular="Collection" />
    </AdminPage>
  );
}