import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CaretRight } from "@phosphor-icons/react";
import { Layout } from "@/components/layout/Layout";
import { useAuthStore } from "@/stores/authStore";

const NAV = [
  { label: "Dashboard", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Account details", href: "/account/details" },
  { label: "Change password", href: "/account/password" },
];

export function AccountLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuthStore();
  const { pathname } = useRouter();

  return (
    <Layout>
      <section className="px-4 pt-6 sm:px-6 lg:px-[50px]">
        <div className="mx-auto max-w-7xl rounded-2xl bg-ink px-6 py-16 text-center text-white">
          <nav className="mb-3 flex items-center justify-center gap-2 text-sm text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <CaretRight size={12} /><span className="text-white">Account</span>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl">My Account</h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-[50px]">
        <div className="flex flex-col gap-10 lg:flex-row">
          <aside className="w-full flex-shrink-0 lg:w-64">
            <nav className="space-y-3">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className={`block text-base transition-colors ${active ? "font-medium text-ink underline underline-offset-8" : "text-ink/50 hover:text-ink"}`}>
                    {item.label}
                  </Link>
                );
              })}
              <button onClick={logout} className="block text-base text-ink/50 hover:text-ink">Logout</button>
            </nav>
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </Layout>
  );
}