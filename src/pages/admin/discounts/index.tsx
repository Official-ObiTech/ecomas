import { useEffect, useState, useCallback } from "react";
import { Plus, PencilSimple, Trash, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import { AdminPage } from "@/components/admin/AdminGuard";
import { EmptyState } from "@/components/admin/ui";
import { fetchClient, toArray } from "@/lib/fetchClient";
import { formatNaira, koboToNaira, nairaToKobo } from "@/lib/payment/money";


interface Discount {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;              // percent, or kobo for FIXED
  active: boolean;
  maxUses: number | null;
  usedCount: number;
  minOrderAmount: number | null; // kobo
  startsAt: string | null;
  expiresAt: string | null;
}

const dateForInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");

export default function AdminDiscounts() {
  const [items, setItems] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(toArray<Discount>(await fetchClient<unknown>("/api/admin/discounts"))); }
    catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const del = async (d: Discount) => {
    if (!confirm(`Delete code "${d.code}"?`)) return;
    try {
      await fetchClient(`/api/admin/discounts/${d.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== d.id));
      toast.success("Discount deleted");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Delete failed"); }
  };

  const toggleActive = async (d: Discount) => {
    try {
      await fetchClient(`/api/admin/discounts/${d.id}`, { method: "PATCH", body: { active: !d.active } });
      setItems((prev) => prev.map((x) => (x.id === d.id ? { ...x, active: !x.active } : x)));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Update failed"); }
  };

  const onSaved = (saved: Discount) => {
    setItems((prev) => (prev.some((i) => i.id === saved.id) ? prev.map((i) => (i.id === saved.id ? saved : i)) : [saved, ...prev]));
    setOpen(false);
  };

  const valueLabel = (d: Discount) => (d.type === "PERCENTAGE" ? `${d.value}%` : formatNaira(d.value));

  return (
    <AdminPage title="Discounts">
      <div className="mb-6 flex justify-end">
        <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-light">
          <Plus size={16} /> New Discount
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No discounts yet" hint="Create a code customers can apply at checkout." action={<button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm text-white hover:bg-ink-light"><Plus size={16} /> New Discount</button>} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 text-left text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Used</th>
                <th className="px-4 py-3 font-medium">Min order</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {items.map((d) => (
                <tr key={d.id} className="hover:bg-subtle">
                  <td className="px-4 py-3 font-mono font-medium text-ink">{d.code}</td>
                  <td className="px-4 py-3 text-ink/70">{valueLabel(d)}</td>
                  <td className="px-4 py-3 text-ink/70">{d.usedCount}{d.maxUses ? ` / ${d.maxUses}` : ""}</td>
                  <td className="px-4 py-3 text-ink/70">{d.minOrderAmount ? formatNaira(d.minOrderAmount) : "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(d)} className={`relative h-5 w-9 rounded-full transition-colors ${d.active ? "bg-ink" : "bg-ink/20"}`} aria-label="Toggle active">
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${d.active ? "left-[18px]" : "left-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditing(d); setOpen(true); }} className="rounded-lg p-2 text-ink/50 hover:bg-cream hover:text-ink"><PencilSimple size={16} /></button>
                      <button onClick={() => del(d)} className="rounded-lg p-2 text-ink/50 hover:bg-red-50 hover:text-red-500"><Trash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && <DiscountModal item={editing} onClose={() => setOpen(false)} onSaved={onSaved} />}
    </AdminPage>
  );
}

function DiscountModal({ item, onClose, onSaved }: { item: Discount | null; onClose: () => void; onSaved: (d: Discount) => void }) {
  const [code, setCode] = useState(item?.code ?? "");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">(item?.type ?? "PERCENTAGE");
  // value shown as percent, or naira for FIXED
  const [value, setValue] = useState(item ? String(item.type === "FIXED" ? koboToNaira(item.value) : item.value) : "");
  const [maxUses, setMaxUses] = useState(item?.maxUses ? String(item.maxUses) : "");
  const [minOrder, setMinOrder] = useState(item?.minOrderAmount ? String(koboToNaira(item.minOrderAmount)) : "");
  const [startsAt, setStartsAt] = useState(dateForInput(item?.startsAt ?? null));
  const [expiresAt, setExpiresAt] = useState(dateForInput(item?.expiresAt ?? null));
  const [active, setActive] = useState(item?.active ?? true);
  const [saving, setSaving] = useState(false);

  const dateForInput2 = (v: string) => v;

  const save = async () => {
    if (!code.trim()) return toast.error("Code is required");
    if (!value || Number(value) <= 0) return toast.error("Enter a value greater than 0");
    if (type === "PERCENTAGE" && Number(value) > 100) return toast.error("Percentage can't exceed 100");

    setSaving(true);
    const body = {
      code: code.trim().toUpperCase(),
      type,
      value: type === "FIXED" ? nairaToKobo(value) : Math.round(Number(value)),
      maxUses: maxUses ? parseInt(maxUses, 10) : null,
      minOrderAmount: minOrder ? nairaToKobo(minOrder) : null,
      startsAt: startsAt || null,
      expiresAt: expiresAt || null,
      active,
    };
    try {
      const res = item
        ? await fetchClient<{ data: Discount }>(`/api/admin/discounts/${item.id}`, { method: "PATCH", body })
        : await fetchClient<{ data: Discount }>("/api/admin/discounts", { method: "POST", body });
      onSaved(res.data);
      toast.success(item ? "Discount updated" : "Discount created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  };

  const input = "w-full rounded-lg border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-ink/40";
  const label = "mb-1.5 block text-sm font-medium text-ink";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-serif text-lg text-ink">{item ? "Edit Discount" : "New Discount"}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink/40 hover:bg-cream hover:text-ink"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={label}>Code</label>
            <input className={`${input} font-mono uppercase`} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SAVE10" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Type</label>
              <select className={input} value={type} onChange={(e) => setType(e.target.value as "PERCENTAGE" | "FIXED")}>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed (₦)</option>
              </select>
            </div>
            <div>
              <label className={label}>{type === "PERCENTAGE" ? "Percent (%)" : "Amount (₦)"}</label>
              <input type="number" min="0" step={type === "PERCENTAGE" ? "1" : "0.01"} className={input} value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Max uses</label>
              <input type="number" min="0" className={input} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="unlimited" />
            </div>
            <div>
              <label className={label}>Min order (₦)</label>
              <input type="number" min="0" step="0.01" className={input} value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Starts</label>
              <input type="date" className={input} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div>
              <label className={label}>Expires</label>
              <input type="date" className={input} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" className="h-4 w-4 accent-ink" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Active
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-ink/15 px-4 py-2 text-sm text-ink hover:bg-cream">Cancel</button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-light disabled:opacity-60">
            {saving ? "Saving…" : item ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}