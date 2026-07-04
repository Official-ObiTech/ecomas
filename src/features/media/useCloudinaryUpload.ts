import { useState } from "react";
import { fetchClient } from "@/lib/fetchClient";

type SignResponse = {
  data: {
    signature: string;
    timestamp: number;
    folder: string;
    apiKey: string;
    cloudName: string;
  };
};

export type UploadedImage = { url: string; publicId: string };

export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function upload(file: File): Promise<UploadedImage> {
    setUploading(true);
    setProgress(0);
    try {
      const { data: sig } = await fetchClient<SignResponse>("/api/admin/upload/sign", {
        method: "POST",
        body: { folder: "ecomas/products" },
      });

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.apiKey);
      form.append("timestamp", String(sig.timestamp));
      form.append("signature", sig.signature);
      form.append("folder", sig.folder);

      const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;

      // XHR so we get upload progress (fetch can't report it)
      const result = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve(JSON.parse(xhr.responseText))
            : reject(new Error("Upload failed"));
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(form);
      });

      return { url: result.secure_url, publicId: result.public_id };
    } finally {
      setUploading(false);
    }
  }

  async function remove(publicId: string) {
    await fetchClient("/api/admin/upload/delete", {
      method: "POST",
      body: { publicId },
    });
  }

  return { upload, remove, uploading, progress };
}