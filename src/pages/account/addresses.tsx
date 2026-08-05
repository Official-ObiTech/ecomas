import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash } from "@phosphor-icons/react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Seo } from "@/components/seo/Seo";
import { fetchClient, toArray } from "@/lib/fetchClient";

interface Address { id: string; fullName: string; phone: string; line1: string; line2?: string | null; city: string; state: string; country: string; }
const input = "w-full rounded-lg border border-ink/20 px-4 py-2.5 text-sm outline-none focus:border-ink/50";

export default function Addresses() {
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fullName: "", phone: "", line1: "", line2: "", city: "", state: "" });
  const [saving, setSaving] = useState(false);

  const load = () => fetchClient<unknown>("/api/account/addresses").then((r) => setItems(toArray<Address>(r))).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.fullName || !form.line1 || !form.city || !form.state) return toast.error("Complete the address");
    setSaving(true);
    try {
      await fetchClient("/api/account/addresses", { method: "POST", body: form });
      setForm({ fullName: "", phone: "", line1: "", line2: "", city: "", state: "" });
      toast.success("Address added"); load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    await fetchClient(`/api/account/addresses/${id}`, { method: "DELETE" });
    setItems((p) => p.filter((a) => a.id !== id)); toast.success("Removed");
  };

  return (
    <AccountLayout>
      <Seo title="Addresses" noIndex />
      <h2 className="mb-5 font-serif text-lg text-ink">Addresses</h2>

      {loading ? <div className="skeleton h-24 rounded-lg" /> : items.length === 0 ? (
        <p className="mb-8 text-sm text-ink/50">No saved addresses yet.</p>
      ) : (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {items.map((a) => (
            <div key={a.id} className="rounded-lg border border-ink/15 p-5">
              <div className="mb-2 flex items-start justify-between">
                <p className="text-sm font-semibold text-ink">{a.fullName}</p>
                <button onClick={() => remove(a.id)} className="text-ink/40 hover:text-red-500"><Trash size={15} /></button>
              </div>
              <div className="space-y-0.5 text-sm text-ink/70">
                <p>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                <p>{a.city}, {a.state}, {a.country}</p>
                <p>{a.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-lg space-y-3 rounded-2xl border border-ink/10 p-6">
        <h3 className="font-medium text-ink">Add new address</h3>
        <input className={input} placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input className={input} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className={input} placeholder="Street address" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
        <input className={input} placeholder="Apartment, suite (optional)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input className={input} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className={input} placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        </div>
        <button onClick={add} disabled={saving} className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
          {saving ? "Adding…" : "Add Address"}
        </button>
      </div>
    </AccountLayout>
  );
}