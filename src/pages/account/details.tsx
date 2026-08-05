import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Seo } from "@/components/seo/Seo";
import { fetchClient } from "@/lib/fetchClient";

const input = "w-full rounded-lg border border-ink/20 px-4 py-3 text-sm outline-none focus:border-ink/50";
const label = "mb-1.5 block text-sm font-medium text-ink";

export default function AccountDetails() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClient<{ data: { name: string | null; email: string; phone: string | null } }>("/api/account/profile")
      .then(({ data }) => { setName(data.name ?? ""); setEmail(data.email); setPhone(data.phone ?? ""); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetchClient("/api/account/profile", { method: "PATCH", body: { name, phone } });
      toast.success("Changes saved");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <AccountLayout>
      <Seo title="Account details" noIndex />
      <div className="max-w-xl space-y-5">
        <h2 className="font-serif text-lg text-ink">Account details</h2>
        {loading ? <div className="skeleton h-40 rounded-lg" /> : (
          <>
            <div><label className={label}>Name</label><input value={name} onChange={(e) => setName(e.target.value)} className={input} /></div>
            <div><label className={label}>Phone number</label><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234…" className={input} /></div>
            <div><label className={label}>Email</label><input value={email} disabled className={`${input} bg-cream text-ink/50`} /><p className="mt-1 text-xs text-ink/40">Email can't be changed.</p></div>
            <button onClick={save} disabled={saving} className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </>
        )}
      </div>
    </AccountLayout>
  );
}