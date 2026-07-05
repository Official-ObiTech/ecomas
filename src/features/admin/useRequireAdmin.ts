import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export function useRequireAdmin() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.replace(`/auth/login?redirect=${router.asPath}`);
    else if (session.user.role !== "ADMIN") router.replace("/");
  }, [session, status, router]);

  return {
    isAdmin: session?.user.role === "ADMIN",
    loading: status === "loading",
  };
}