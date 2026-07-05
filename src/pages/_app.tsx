import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "@/styles/globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans-family" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif-family" });

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <div className={`${sans.variable} ${serif.variable} font-sans text-ink`}>
        <Component {...pageProps} />
        <Toaster richColors position="top-right" />
      </div>
    </SessionProvider>
  );
}