import { useState } from "react";
import { toast } from "sonner";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Seo } from "@/components/seo/Seo";
import { PasswordField } from "@/components/auth/fields";
import { fetchClient } from "@/lib/fetchClient";

export default function ChangePassword() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!currentPassword || !newPassword) return toast.error("Fill in all fields");
    if (newPassword !== confirm) return toast.error("New passwords don't match");
    setSaving(true);
    try {
      await fetchClient("/api/account/password", { method: "POST", body: { currentPassword, newPassword } });
      setCurrent(""); setNew(""); setConfirm("");
      toast.success("Password updated");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Update failed"); }
    finally { setSaving(false); }
  };

  return (
    <AccountLayout>
      <Seo title="Change password" noIndex />
      <div className="max-w-md space-y-5">
        <h2 className="font-serif text-lg text-ink">Change password</h2>
        <PasswordField placeholder="Current password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} />
        <PasswordField placeholder="New password (min 8)" value={newPassword} onChange={(e) => setNew(e.target.value)} />
        <PasswordField placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button onClick={save} disabled={saving} className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
          {saving ? "Updating…" : "Save Changes"}
        </button>
      </div>
    </AccountLayout>
  );
}