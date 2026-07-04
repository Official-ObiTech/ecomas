import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";



export default function App({ Component,    pageProps: { session, ...pageProps }}: AppProps) {
    <>
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <Toaster position="top-center" richColors closeButton />
      </SessionProvider>
    </>
}
