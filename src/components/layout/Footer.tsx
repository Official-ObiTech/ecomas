import Link from "next/link";
import { Globe, ShareNetwork, At, RssSimple } from "@phosphor-icons/react";
import Logo from "@/components/brand/Logo";
import { siteConfig } from "@/config/site";

const columns = [
  { title: "Shop", links: [
    { label: "My Account", href: "/account" },
    { label: "Login", href: "/auth/login" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/cart" },
  ]},
  { title: "Information", links: [
    { label: "Shipping Policy", href: "#" },
    { label: "Returns & Refunds", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Contact Us", href: "/contact" },
  ]},
  { title: "Company", links: [
    { label: "About Us", href: "/about" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms & Conditions", href: "#" },
  ]},
];

export default function Footer() {
  const social = [Globe, ShareNetwork, At, RssSimple];
  return (
    <footer className="bg-ink text-white/70">
      <div className="border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-[50px] py-16 text-center">
          <h2 className="mx-auto max-w-2xl font-serif text-2xl leading-snug text-white sm:text-3xl">
            Your favorite online store — what you need, when you need it.
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-[50px]">
        <div className="col-span-2 md:col-span-1">
          <Logo href="/" size="md" withName className="text-white mb-4" />
          <p className="mb-4 text-sm text-white/50 leading-relaxed">
            {siteConfig.description}
          </p>
          <div className="flex gap-3">
            {social.map((Icon, i) => (
              <a key={i} href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-white hover:text-ink">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/40 sm:flex-row sm:px-6 lg:px-[50px]">
          <p>© {new Date().getFullYear()} {siteConfig.name}</p>
          <span>English · {siteConfig.currency}</span>
        </div>
      </div>
    </footer>
  );
}