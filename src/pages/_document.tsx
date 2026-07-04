import { Html, Head, Main, NextScript } from "next/document";
import { siteConfig } from "@/config/site";

export default function Document() {
  return (
    <Html lang="en">
  <Head>
        <link rel="icon" href={siteConfig.logo.icon} />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
