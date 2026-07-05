import { AdminPage } from "@/components/admin/AdminGuard";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";

export default function AdminCategories() {
  return (
    <AdminPage title="Categories">
      <TaxonomyManager basePath="/api/admin/categories" singular="Category" />
    </AdminPage>
  );
}