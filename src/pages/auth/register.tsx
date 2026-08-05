import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Seo } from "@/components/seo/Seo";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { TextField, PasswordField } from "@/components/auth/fields";
import { GoogleIcon, FacebookIcon } from "@/components/auth/SocialIcons";
import { fetchClient } from "@/lib/fetchClient";

interface FormValues { name: string; email: string; password: string; agree: boolean; }

export default function RegisterPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"form" | "otp">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: "", email: "", password: "", agree: false },
  });

  const onSubmit = async (v: FormValues) => {
    setError(""); setLoading(true);
    try {
      await fetchClient("/api/auth/register", { method: "POST", body: { name: v.name, email: v.email, password: v.password } });
      setEmail(v.email);
      setPassword(v.password);
      setStage("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await fetchClient("/api/auth/verify", { method: "POST", body: { email, code: otp } });
      // account is now verified — sign them in
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) { router.push("/auth/login"); return; }
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setResendMsg("");
    try {
      await fetchClient("/api/auth/verify/resend", { method: "POST", body: { email } });
      setResendMsg("New code sent.");
    } catch {
      setResendMsg("Couldn't resend. Try again.");
    }
  };

  return (
    <>
      <Seo title="Create account" noIndex />
      <AuthLayout heroAlt="Sign up">
        {stage === "form" ? (
          <>
            <Text as="h1" size="3xl" weight="bold" font="serif">Create your account</Text>
            <Text color="var(--color-muted)" className="mt-3">
              Already have one?{" "}
              <Link href="/auth/login" className="font-semibold text-ink hover:underline">Sign in</Link>
            </Text>

            {error && <Text size="sm" color="var(--color-danger)" className="mt-4">{error}</Text>}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-7" noValidate>
              <TextField placeholder="Your name" autoComplete="name" disabled={loading}
                error={errors.name?.message} {...register("name", { required: "Name is required" })} />
              <TextField type="email" placeholder="Email address" autoComplete="email" disabled={loading}
                error={errors.email?.message}
                {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" } })} />
              <PasswordField placeholder="Password (min 8 chars)" autoComplete="new-password" disabled={loading}
                error={errors.password?.message}
                {...register("password", { required: "Password is required", minLength: { value: 8, message: "At least 8 characters" } })} />
              <Checkbox label="I agree to the Terms and Privacy Policy"
                {...register("agree", { required: true })} />

              <Button type="submit" size="lg" fullWidth loading={loading} className="!rounded-full">Create account</Button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <span className="h-px flex-1 bg-line" />
              <Text size="sm" color="var(--color-muted)">or sign up with</Text>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" className="!rounded-full" leftIcon={<GoogleIcon />} onClick={() => signIn("google", { callbackUrl: "/" })}>Google</Button>
              <Button variant="outline" size="lg" className="!rounded-full" leftIcon={<FacebookIcon />} onClick={() => signIn("facebook", { callbackUrl: "/" })}>Facebook</Button>
            </div>
          </>
        ) : (
          <>
            <Text as="h1" size="3xl" weight="bold" font="serif">Verify your email</Text>
            <Text color="var(--color-muted)" className="mt-3">
              We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>
            </Text>

            {error && <Text size="sm" color="var(--color-danger)" className="mt-4">{error}</Text>}

            <form onSubmit={confirmOtp} className="mt-8">
              <TextField inputMode="numeric" value={otp} placeholder="------" maxLength={6} autoFocus disabled={loading}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-3xl font-semibold tracking-[0.5em]" />
              <Button type="submit" size="lg" fullWidth loading={loading} disabled={otp.length !== 6} className="mt-8 !rounded-full">
                Verify & continue
              </Button>
            </form>

            <Text size="sm" color="var(--color-muted)" className="mt-6">
              Didn't get it?{" "}
              <button onClick={resend} disabled={loading} className="font-semibold text-ink hover:underline disabled:opacity-60">Resend</button>
              {resendMsg && <span className="ml-2">{resendMsg}</span>}
            </Text>
          </>
        )}
      </AuthLayout>
    </>
  );
}