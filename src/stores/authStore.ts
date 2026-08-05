import { useSession, signOut } from "next-auth/react";
import { useMemo } from "react";

export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  firstName: string;   // derived from name, for old pages that expect it
  lastName: string;
  phoneNumber: string; // filled from /api/account/profile when needed
  role: string;
}

export function useAuthStore() {
  const { data: session, status } = useSession();

  const user = useMemo<AuthUser | null>(() => {
    if (!session?.user) return null;
    const full = session.user.name ?? "";
    const [firstName, ...rest] = full.split(" ");
    return {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      firstName: firstName || "",
      lastName: rest.join(" "),
      phoneNumber: "",
      role: (session.user as any).role ?? "CUSTOMER",
    };
  }, [session]);

  return {
    user,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    logout: () => signOut({ callbackUrl: "/" }),
    fetchMe: () => {}, // NextAuth keeps session fresh; no-op for compatibility
  };
}