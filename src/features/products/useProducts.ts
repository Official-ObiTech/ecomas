import { useEffect, useState } from "react";
import { fetchClient, toArray } from "@/lib/fetchClient";
import type { Product } from "@/types/product";

interface UseProductsParams {
  featured?: boolean;
  category?: string;
  collection?: string;
  limit?: number;
  q?: string;
}

export function useProducts(params: UseProductsParams = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (params.featured) qs.set("featured", "true");
    if (params.category) qs.set("category", params.category);
    if (params.collection) qs.set("collection", params.collection);
    if (params.q) qs.set("q", params.q);
    qs.set("limit", String(params.limit ?? 8));

    let active = true;
    setLoading(true);
    fetchClient<unknown>(`/api/products?${qs.toString()}`)
      .then((res) => {
        if (active) setProducts(toArray<Product>(res));
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  return { products, loading };
}



// unwrap { success, data } or { data: { data } }
function unwrap<T>(res: unknown): T | null {
  const d = (res as { data?: unknown })?.data as { data?: unknown } | undefined;
  return ((d?.data ?? d) as T) ?? null;
}

export function useProduct(slug?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setNotFound(false);

    fetchClient<unknown>(`/api/products/${slug}`)
      .then((res) => {
        if (!active) return;
        const p = unwrap<Product>(res);
        if (p) setProduct(p);
        else setNotFound(true);
      })
      .catch(() => { if (active) setNotFound(true); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [slug]);

  return { product, loading, notFound };
}