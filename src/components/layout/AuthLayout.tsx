import { ReactNode } from "react";
import Image from "next/image";
import Logo from "@/components/brand/Logo";

interface AuthLayoutProps {
  children: ReactNode;
  heroImage?: string;
  heroAlt?: string;
}

export function AuthLayout({ children, heroImage = "/brand/auth.jpg", heroAlt = "Ecomas" }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Image side */}
      <div className="hidden lg:block lg:w-1/2 p-4">
        <div className="relative h-[calc(100vh-2rem)] w-full overflow-hidden rounded-3xl bg-cream">
          <Image src={heroImage} alt={heroAlt} fill priority sizes="50vw" className="object-cover" />
        </div>
      </div>

      {/* Form side */}
      <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 md:px-16 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-[420px]">
          <Logo href="/" size="md" withName className="mb-10" />
          {children}
        </div>
      </div>
    </div>
  );
}