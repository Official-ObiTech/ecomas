import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "@/components/cart/CartDrawer";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}