import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { fetchClient } from "@/lib/fetchClient";
import { Seo } from "@/components/seo/Seo";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleRegister() {
    setError("");
    try {
   await fetchClient("/api/auth/register", {
  method: "POST",
  body: { name, email, password },
  notifyError: true,
});
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) setError("Registered, but sign-in failed");
      else router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <>
      <Seo title="Register" noIndex />
      <div className="max-w-sm mx-auto py-20 space-y-3">
        <h1 className="text-xl font-semibold">Register (temp)</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input className="border w-full p-2" placeholder="Name"
          value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border w-full p-2" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border w-full p-2" type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-black text-white w-full p-2" onClick={handleRegister}>
          Create account
        </button>
        <a href="/auth/login" className="text-sm underline block text-center">Back to login</a>
      </div>
    </>
  );
}