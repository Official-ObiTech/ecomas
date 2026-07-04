import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { Seo } from "@/components/seo/Seo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleCredentials() {
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Invalid email or password");
    else router.push("/");
  }

  return (
    <>
      <Seo title="Login" noIndex />
      <div className="max-w-sm mx-auto py-20 space-y-3">
        <h1 className="text-xl font-semibold">Login (temp)</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input className="border w-full p-2" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border w-full p-2" type="password" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-black text-white w-full p-2" onClick={handleCredentials}>
          Sign in
        </button>
        <button className="border w-full p-2" onClick={() => signIn("google")}>Google</button>
        <button className="border w-full p-2" onClick={() => signIn("facebook")}>Facebook</button>
        <a href="/auth/register" className="text-sm underline block text-center">Create account</a>
      </div>
    </>
  );
}