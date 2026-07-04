import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,


   compiler: {
    // strips ALL console.* from production builds; local dev keeps them
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
