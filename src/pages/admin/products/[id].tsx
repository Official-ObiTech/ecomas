import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft } from "@phosphor-icons/react";
import { AdminPage } from "@/components/admin/AdminGuard";
import { ProductImages } from "@/components/admin/ProductImages";
import { fetchClient, toArray } from "@/lib/fetchClient";
import { koboToNaira, nairaToKobo } from "@/lib/payment/money";


interface FormValues {
  name: string;
  slug: string;
  description: string;
  price: string;          // naira
  compareAtPrice: string; // naira
  stock: string;
  sku: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  categoryId: string;
}
interface Option { id: string; name: string }

export default function ProductForm() {
  const router = useRouter();
  const idParam = router.query.id as string | undefined;
  const isNew = idParam === "new";

  const [categories, setCategories] = useState<Option[]>([]);
  const [collections, setCollections] = useState<Option[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(isNew);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { status: "DRAFT", featured: false, categoryId: "", price: "", compareAtPrice: "", stock: "0", sku: "", description: "", name: "", slug: "" },
  });

  // load categories + collections
  useEffect(() => {
    fetchClient<unknown>("/api/admin/categories").then((r) => setCategories(toArray<Option>(r))).catch(() => {});
    fetchClient<unknown>("/api/admin/collections").then((r) => setCollections(toArray<Option>(r))).catch(() => {});
  }, []);

  // load existing product when editing
  useEffect(() => {
    if (isNew || !idParam) return;
    fetchClient<{ data: any }>(`/api/admin/products/${idParam}`)
      .then(({ data: p }) => {
        reset({
          name: p.name,
          slug: p.slug,
          description: p.description ?? "",
          price: String(koboToNaira(p.price)),
          compareAtPrice: p.compareAtPrice != null ? String(koboToNaira(p.compareAtPrice)) : "",
          stock: String(p.stock),
          sku: p.sku ?? "",
          status: p.status,
          featured: p.featured,
          categoryId: p.categoryId ?? p.category?.id ?? "",
        });
        setImages(p.images ?? []);
        setSelectedCollections((p.collections ?? []).map((c: Option) => c.id));
      })
      .catch(() => toast.error("Couldn't load product"))
      .finally(() => setLoaded(true));
  }, [idParam, isNew, reset]);

  const onSubmit = async (v: FormValues) => {
    setSaving(true);
    const body = {
      name: v.name,
      slug: v.slug || undefined,
      description: v.description || null,
      price: nairaToKobo(v.price),
      compareAtPrice: v.compareAtPrice ? nairaToKobo(v.compareAtPrice) : null,
      stock: parseInt(v.stock, 10) || 0,
      sku: v.sku || null,
      status: v.status,
      featured: v.featured,
      categoryId: v.categoryId || null,
      collectionIds: selectedCollections,
      images,
    };
    try {
      if (isNew) {
        await fetchClient("/api/admin/products", { method: "POST", body });
        toast.success("Product created");
      } else {
        await fetchClient(`/api/admin/products/${idParam}`, { method: "PATCH", body });
        toast.success("Product updated");
      }
      router.push("/admin/products");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  };

  const input = "w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-ink/40";
  const label = "mb-1.5 block text-sm font-medium text-ink";

  return (
    <AdminPage title={isNew ? "New Product" : "Edit Product"}>
      <Link href="/admin/products" className="mb-6 inline-flex items-center gap-2 text-sm text-ink/50 hover:text-ink">
        <ArrowLeft size={16} /> Back to products
      </Link>

      {!loaded ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-11 rounded-lg" />)}</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-3xl gap-6">
          <div className="rounded-xl border border-ink/10 bg-white p-6">
            <p className="mb-4 font-medium text-ink">Images</p>
            <ProductImages images={images} onChange={setImages} />
          </div>

          <div className="grid gap-5 rounded-xl border border-ink/10 bg-white p-6">
            <div>
              <label className={label}>Name</label>
              <input className={input} {...register("name", { required: "Name is required" })} />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className={label}>Slug (optional — auto from name)</label>
              <input className={input} placeholder="leave blank to auto-generate" {...register("slug")} />
            </div>
            <div>
              <label className={label}>Description</label>
              <textarea rows={4} className={input} {...register("description")} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Price (₦)</label>
                <input type="number" step="0.01" min="0" className={input} {...register("price", { required: "Price is required" })} />
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
              </div>
              <div>
                <label className={label}>Compare-at price (₦)</label>
                <input type="number" step="0.01" min="0" className={input} placeholder="optional" {...register("compareAtPrice")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Stock</label>
                <input type="number" min="0" className={input} {...register("stock")} />
              </div>
              <div>
                <label className={label}>SKU</label>
                <input className={input} placeholder="optional" {...register("sku")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={label}>Category</label>
                <select className={input} {...register("categoryId")}>
                  <option value="">Uncategorized</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Status</label>
                <select className={input} {...register("status")}>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" className="h-4 w-4 accent-ink" {...register("featured")} />
              Featured product
            </label>

            {collections.length > 0 && (
              <div>
                <label className={label}>Collections</label>
                <div className="flex flex-wrap gap-2">
                  {collections.map((c) => {
                    const on = selectedCollections.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCollections((prev) => on ? prev.filter((x) => x !== c.id) : [...prev, c.id])}
                        className={`rounded-full border px-3 py-1.5 text-sm ${on ? "border-ink bg-ink text-white" : "border-ink/15 text-ink/60 hover:border-ink/40"}`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/admin/products" className="rounded-lg border border-ink/15 px-5 py-2.5 text-sm text-ink hover:bg-cream">Cancel</Link>
            <button type="submit" disabled={saving} className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-light disabled:opacity-60">
              {saving ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </AdminPage>
  );
}