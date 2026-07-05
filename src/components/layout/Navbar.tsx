import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingBag, MagnifyingGlass, Heart, User, List, X,
} from "@phosphor-icons/react";
import Logo from "@/components/brand/Logo";
import { siteConfig } from "@/config/site";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Collections", href: "/collections" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const totalItems = useCartStore((s) => s.totalItems);
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-ink text-white text-xs tracking-wide">
        <div className="px-4 sm:px-6 lg:px-[50px] h-9 flex items-center justify-between gap-4">
          <span className="hidden sm:inline text-white/70">
            {siteConfig.contact.phone ? `Support ${siteConfig.contact.phone}` : "Free shipping on orders over ₦50,000"}
          </span>
          <span className="mx-auto sm:mx-0 uppercase tracking-widest">
            New season just dropped —{" "}
            <Link href="/products" className="underline underline-offset-2 hover:text-white/80">Shop Now</Link>
          </span>
          <span className="hidden sm:inline text-white/70">EN · {siteConfig.currency}</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream border-b border-ink/10">
        <nav className="px-4 sm:px-6 lg:px-[50px] h-18 py-3 flex items-center justify-between gap-4">
          <Logo href="/" size="md" withName />

          <div className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}
                className="px-3 py-2 text-sm text-ink/80 hover:text-ink transition-colors">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen((v) => !v)} className="p-2 text-ink/70 hover:text-ink" aria-label="Search">
              <MagnifyingGlass size={20} />
            </button>

            <Link href="/wishlist" className="hidden sm:flex relative p-2 text-ink/70 hover:text-ink" aria-label="Wishlist">
              <Heart size={20} />
              {mounted && wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="p-2 text-ink/70 hover:text-ink" aria-label="Account"><User size={20} /></button>
                <div className="absolute right-0 top-full hidden min-w-44 rounded-lg border border-ink/10 bg-white p-2 shadow-lg group-hover:block z-50">
                  <div className="border-b border-ink/10 px-3 py-2 text-sm text-ink/50">{user.name ?? user.email}</div>
                  <Link href="/account" className="block rounded px-3 py-2 text-sm text-ink/80 hover:bg-cream">My Account</Link>
                  <Link href="/account/orders" className="block rounded px-3 py-2 text-sm text-ink/80 hover:bg-cream">Orders</Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full rounded px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50">Logout</button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="hidden sm:flex p-2 text-ink/70 hover:text-ink" aria-label="Login"><User size={20} /></Link>
            )}

            <button onClick={openCart} className="relative p-2 text-ink/70 hover:text-ink" aria-label="Cart">
              <ShoppingBag size={20} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            <button className="md:hidden p-2 text-ink/70" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
              {menuOpen ? <X size={20} /> : <List size={20} />}
            </button>
          </div>
        </nav>

        {searchOpen && (
          <div className="border-t border-ink/10">
            <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl gap-3 px-4 py-3">
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink/40" />
              <button type="submit" className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white hover:bg-ink-light">Search</button>
            </form>
          </div>
        )}

        {menuOpen && (
          <div className="md:hidden border-t border-ink/10 bg-cream">
            <div className="space-y-1 px-4 py-3">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm text-ink/80">{item.label}</Link>
              ))}
              <div className="border-t border-ink/10 pt-2">
                {user ? (
                  <>
                    <Link href="/account" className="block py-2 text-sm text-ink/80" onClick={() => setMenuOpen(false)}>My Account</Link>
                    <button onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }} className="block py-2 text-sm text-red-500">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="block py-2 text-sm text-ink/80" onClick={() => setMenuOpen(false)}>Login</Link>
                    <Link href="/auth/register" className="block py-2 text-sm text-ink" onClick={() => setMenuOpen(false)}>Create Account</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}