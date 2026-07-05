import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, PencilSimple, Trash, X, UploadSimple, Spinner } from "@phosphor-icons/react";
import { toast } from "sonner";
import { fetchClient, toArray } from "@/lib/fetchClient";
import { useCloudinaryUpload } from "@/features/media/useCloudinaryUpload";
import { EmptyState } from "@/components/admin/ui";

interface TaxItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: { products: number };
}

interface Props {
  basePath: string;     // "/api/admin/categories" | "/api/admin/collections"
  singular: string;     // "Category" | "Collection"
}

export function TaxonomyManager({ basePath, singular }: Props) {
  const [items, setItems] = useState<TaxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TaxItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(toArray<TaxItem>(await fetchClient<unknown>(basePath)));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [basePath]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setIsOpen(true); };
  const openEdit = (item: TaxItem) => { setEditing(item); setIsOpen(true); };

  const handleDelete = async (item: TaxItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await fetchClient(`${basePath}/${item.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`${singular} deleted`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const onSaved = (saved: TaxItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === saved.id);
      return exists ? prev.map((i) => (i.id === saved.id ? { ...i, ...saved } : i)) : [saved, ...prev];
    });
    setIsOpen(false);
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-light">
          <Plus size={16} /> New {singular}
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={`No ${singular.toLowerCase()}s yet`}
          hint={`Create your first ${singular.toLowerCase()}.`}
          action={<button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm text-white hover:bg-ink-light"><Plus size={16} /> New {singular}</button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-xl border border-ink/10 bg-white p-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
                {item.image ? <Image src={item.image} alt={item.name} width={64} height={64} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs text-ink/30">No image</div>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{item.name}</p>
                <p className="truncate text-xs text-ink/40">/{item.slug}</p>
                {item._count && <p className="mt-1 text-xs text-ink/50">{item._count.products} products</p>}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => openEdit(item)} className="rounded-lg p-1.5 text-ink/50 hover:bg-cream hover:text-ink" aria-label="Edit"><PencilSimple size={15} /></button>
                <button onClick={() => handleDelete(item)} className="rounded-lg p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-500" aria-label="Delete"><Trash size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <TaxonomyModal
          basePath={basePath}
          singular={singular}
          item={editing}
          onClose={() => setIsOpen(false)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}

function TaxonomyModal({
  basePath, singular, item, onClose, onSaved,
}: {
  basePath: string;
  singular: string;
  item: TaxItem | null;
  onClose: () => void;
  onSaved: (t: TaxItem) => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [image, setImage] = useState<string | null>(item?.image ?? null);
  const [saving, setSaving] = useState(false);
  const { upload, uploading, progress } = useCloudinaryUpload();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const { url } = await upload(file);
      setImage(url);
    } catch {
      toast.error("Upload failed");
    }
  };

  const save = async () => {
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
    const body = { name: name.trim(), slug: slug.trim() || undefined, description: description.trim() || null, image };
    try {
      const res = item
        ? await fetchClient<{ data: TaxItem }>(`${basePath}/${item.id}`, { method: "PATCH", body })
        : await fetchClient<{ data: TaxItem }>(basePath, { method: "POST", body });
      onSaved(res.data);
      toast.success(item ? `${singular} updated` : `${singular} created`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  };

  const input = "w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-ink/40";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-serif text-lg text-ink">{item ? `Edit ${singular}` : `New ${singular}`}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink/40 hover:bg-cream hover:text-ink"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
              {image ? <Image src={image} alt="" width={80} height={80} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xs text-ink/30">No image</div>}
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink/15 px-3 py-2 text-sm text-ink/70 hover:bg-cream">
              {uploading ? <><Spinner size={16} className="animate-spin" /> {progress}%</> : <><UploadSimple size={16} /> {image ? "Replace" : "Upload"}</>}
              <input type="file" accept="image/*" hidden onChange={onFile} disabled={uploading} />
            </label>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Name</label>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Slug (optional)</label>
            <input className={input} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Description</label>
            <textarea rows={3} className={input} value={description ?? ""} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-ink/15 px-4 py-2 text-sm text-ink hover:bg-cream">Cancel</button>
          <button onClick={save} disabled={saving || uploading} className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-light disabled:opacity-60">
            {saving ? "Saving…" : item ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}