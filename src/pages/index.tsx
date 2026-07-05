import { Layout } from "@/components/layout/Layout";
import { Seo } from "@/components/seo/Seo";
import { Hero } from "@/components/home/Hero";
import { ProductRow } from "@/components/home/ProductRow";
import { ProductTabs } from "@/components/home/ProductTabs";
import { EditorialBand } from "@/components/home/EditorialBand";
import { FeatureStrip } from "@/components/home/FeatureStrip";

export default function Home() {
  return (
    <Layout>
      <Seo />
      <Hero />
      <ProductRow title="Latest Arrivals" limit={4} />
      <ProductTabs />
      <EditorialBand />
      <FeatureStrip />
    </Layout>
  );
}