export const siteConfig = {
  name: "Ecomas",
  description: "Shop the latest collections at Ecomas.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  logo: {
    light: "/logo.svg",
    dark: "/logo-dark.svg",
    icon: "/favicon.ico",
  },
  ogImage: "/og.png",
  currency: "NGN",
  locale: "en_NG",
  contact: { email: "support@ecomas.com", phone: "" },
  social: { instagram: "", facebook: "", twitter: "" },
} as const;

export type SiteConfig = typeof siteConfig;