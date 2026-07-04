
import { Seo } from "@/components/seo/Seo";
import { Upload } from "@/features/media/Upload";

export default function AdminHome() {
  return (
    <>
      <Seo title="Admin" noIndex />
      <Upload />
    </>
  );
}