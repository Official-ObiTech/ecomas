import { ReactNode } from "react";
import { siteConfig } from "@/config/site";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4">
        <span className="font-semibold">{siteConfig.name}</span>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t px-6 py-6 text-sm text-neutral-500">
        © {new Date().getFullYear()} {siteConfig.name}
      </footer>
    </div>
  );
}