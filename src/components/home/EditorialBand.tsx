import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";

export function EditorialBand() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-[50px]">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <span className="mb-4 block text-sm font-semibold uppercase tracking-wider text-accent">Trending</span>
          <h2 className="mb-5 font-serif text-4xl leading-tight text-ink md:text-5xl">Made from the finest materials</h2>
          <p className="mb-8 max-w-md leading-relaxed text-ink/60">
            Thoughtfully sourced fabrics and considered construction — pieces made to last, not just to trend.
          </p>
          <Link href="/collections" className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:opacity-90">
            See Collections <ArrowRight size={16} />
          </Link>
        </div>
        <div className="relative h-[420px]">
          <div className="absolute right-0 top-0 h-[340px] w-[62%] overflow-hidden rounded-lg bg-cream">
            <Image src="/brand/editorial-1.jpg" alt="" fill className="object-cover" sizes="40vw" />
          </div>
          <div className="absolute bottom-0 left-0 h-[300px] w-[46%] overflow-hidden rounded-lg bg-cream ring-8 ring-white">
            <Image src="/brand/editorial-2.jpg" alt="" fill className="object-cover" sizes="30vw" />
          </div>
        </div>
      </div>
    </section>
  );
}