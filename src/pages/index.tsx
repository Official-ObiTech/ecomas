import { Layout } from "@/components/layout/Layout";
import { Seo } from "@/components/seo/Seo";

export default function Home() {
  return (
    <Layout>
      <Seo title="Home" />
      <section className="px-6 py-20 text-center">
        <h1 className="text-3xl text-white font-bold">Ecomas foundation is live 🎉</h1>
      </section>
    </Layout>
  );
}