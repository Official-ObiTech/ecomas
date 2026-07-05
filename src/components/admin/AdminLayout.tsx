import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import {
  SquaresFour, Package, Receipt, Tag, Stack, FolderSimple, Users,
  SignOut, List, X, Storefront,
} from "@phosphor-icons/react";
import { siteConfig } from "@/config/site";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: SquaresFour },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: Receipt },
  { label: "Categories", href: "/admin/categories", icon: FolderSimple },
  { label: "Collections", href: "/admin/collections", icon: Stack },
  { label: "Discounts", href: "/admin/discounts", icon: Tag },
  { label: "Customers", href: "/admin/customers", icon: Users },
];

export function AdminLayout({ children, title }: { children: ReactNode; title?: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? router.pathname === "/admin" : router.pathname.startsWith(href);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-ink/10 px-6">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-serif font-semibold text-cream">
          {siteConfig.name.charAt(0)}
        </span>
        <span className="font-serif text-lg">{siteConfig.name}</span>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-ink/40">Admin</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              isActive(href) ? "bg-ink text-white" : "text-ink/70 hover:bg-cream"
            }`}
          >
            <Icon size={18} weight={isActive(href) ? "fill" : "regular"} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-ink/10 p-4">
        <Link href="/" className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink/70 hover:bg-cream">
          <Storefront size={18} /> View storefront
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 hover:bg-red-50">
          <SignOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-subtle">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink/10 bg-white lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white lg:hidden">{SidebarContent}</aside>
        </>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-ink/10 bg-white/80 px-4 backdrop-blur sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menu"><List size={22} /></button>
          <h1 className="font-serif text-xl text-ink">{title ?? "Dashboard"}</h1>
          <div className="ml-auto flex items-center gap-2 text-sm text-ink/60">
            <span className="hidden sm:inline">{session?.user?.name ?? session?.user?.email}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-semibold text-white">
              {(session?.user?.name ?? "A").charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}