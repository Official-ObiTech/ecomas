import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "@phosphor-icons/react";
import { siteConfig } from "@/config/site";

export function Hero() {
  return (
    <section className="grid md:grid-cols-2">
      <div className="relative h-72 bg-cream md:h-[560px]">
        <Image
          src="/brand/hero.jpg"
          alt="New arrivals"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="flex flex-col justify-center bg-ink px-8 py-16 text-white sm:px-14 md:h-[560px]">
        <span className="mb-4 text-base text-white/70">New Arrivals</span>
        <h1 className="mb-5 font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">
          Your dream shop is a click away.
        </h1>
        <p className="mb-8 max-w-md text-base leading-relaxed text-white/70">
          {siteConfig.description}
        </p>
        <Link
          href="/products"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-ink transition-colors hover:bg-cream"
        >
          Shop Now <ShoppingBag size={18} />
        </Link>
      </div>
    </section>
  );
}