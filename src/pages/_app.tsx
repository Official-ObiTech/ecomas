import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
    <>
      <Component {...pageProps} />
      <Toaster position="top-center" richColors closeButton />
    </>
}
