import { useState } from "react";
import { useCloudinaryUpload, UploadedImage } from "@/features/media/useCloudinaryUpload";
import { CloudinaryImage } from "@/components/ui/CloudinaryImage";

export function Upload() {
  const { upload, remove, uploading, progress } = useCloudinaryUpload();
  const [images, setImages] = useState<UploadedImage[]>([]);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await upload(file);
    setImages((prev) => [...prev, img]);
  }

  async function onRemove(img: UploadedImage) {
    await remove(img.publicId);
    setImages((prev) => prev.filter((i) => i.publicId !== img.publicId));
  }

  return (
    <div className="p-6 space-y-4">
      <input type="file" accept="image/*" onChange={onFile} disabled={uploading} />
      {uploading && <p>Uploading… {progress}%</p>}
      <div className="flex gap-3 flex-wrap">
        {images.map((img) => (
          <div key={img.publicId} className="relative">
            <CloudinaryImage src={img.url} alt="upload" width={120} height={120}
              className="object-cover rounded" />
            <button onClick={() => onRemove(img)} className="text-xs text-red-600 block">
              remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}