import Image from "next/image";
import { X, UploadSimple, Spinner } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useCloudinaryUpload } from "@/features/media/useCloudinaryUpload";

export function ProductImages({
  images,
  onChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const { upload, uploading, progress } = useCloudinaryUpload();

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const file of files) {
      try {
        const { url } = await upload(file);
        onChange([...images, url]);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-lg bg-cream">
            <Image src={url} alt="" fill className="object-cover" sizes="96px" />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-ink px-1.5 py-0.5 text-[10px] text-white">Main</span>}
            <button
              type="button"
              onClick={() => onChange(images.filter((u) => u !== url))}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-ink opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink/25 text-ink/40 hover:border-ink/50 hover:text-ink/60">
          {uploading ? (
            <><Spinner size={20} className="animate-spin" /><span className="text-[10px]">{progress}%</span></>
          ) : (
            <><UploadSimple size={20} /><span className="text-[10px]">Add</span></>
          )}
          <input type="file" accept="image/*" multiple hidden onChange={onFiles} disabled={uploading} />
        </label>
      </div>
      <p className="mt-2 text-xs text-ink/40">First image is the main product photo.</p>
    </div>
  );
}