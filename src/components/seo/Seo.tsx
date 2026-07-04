import Head from "next/head";
import { siteConfig } from "@/config/site";

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
}

export function Seo({ title, description, image, canonical, noIndex }: SeoProps) {
  const pageTitle = title ? `${title} — ${siteConfig.name}` : siteConfig.name;
  const desc = description ?? siteConfig.description;
  const ogImage = image ?? siteConfig.ogImage;
  const url = canonical ?? siteConfig.url;

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />
    </Head>
  );
}