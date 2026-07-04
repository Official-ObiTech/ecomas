import Image, { ImageProps } from "next/image";
import { siteConfig } from "@/config/site";

type Props = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
};

export function CloudinaryImage({ src, alt, ...rest }: Props) {
  const finalSrc = src && src.length > 0 ? src : siteConfig.logo.light;
  return <Image src={finalSrc} alt={alt} {...rest} />;
}