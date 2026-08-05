import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Seo } from "@/components/seo/Seo";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { TextField, PasswordField } from "@/components/auth/fields";
import { GoogleIcon, FacebookIcon } from "@/components/auth/SocialIcons";

export default function LoginPage() {
  const router = useRouter();
  const redirect = (router.query.redirect as string) || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password");
    else router.push(redirect);
  };

  return (
    <>
      <Seo title="Sign in" noIndex />
      <AuthLayout heroAlt="Sign in">
        <Text as="h1" size="3xl" weight="bold" font="serif">Welcome back</Text>
        <Text color="var(--color-muted)" className="mt-3">
          New here?{" "}
          <Link href="/auth/register" className="font-semibold text-ink hover:underline">Create an account</Link>
        </Text>

        {error && <Text size="sm" color="var(--color-danger)" className="mt-4">{error}</Text>}

        <form onSubmit={submit} className="mt-8 space-y-7">
          <TextField type="email" placeholder="Email address" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} required />
          <PasswordField placeholder="Password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required />

          <div className="flex items-center justify-between">
            <Checkbox label="Remember me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <Link href="/auth/forgot-password" className="text-sm font-medium text-ink hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="lg" fullWidth loading={loading} className="!rounded-full">Sign in</Button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-line" />
          <Text size="sm" color="var(--color-muted)">or continue with</Text>
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="lg" className="!rounded-full" leftIcon={<GoogleIcon />}
            onClick={() => signIn("google", { callbackUrl: redirect })}>Google</Button>
          <Button variant="outline" size="lg" className="!rounded-full" leftIcon={<FacebookIcon />}
            onClick={() => signIn("facebook", { callbackUrl: redirect })}>Facebook</Button>
        </div>
      </AuthLayout>
    </>
  );
}