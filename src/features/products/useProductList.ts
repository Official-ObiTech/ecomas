import { useEffect, useState } from "react";
import { fetchClient, toArray } from "@/lib/fetchClient";
import type { Product } from "@/types/product";

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Params {
  category?: string;
  q?: string;
  sort?: string;        // "createdAt" | "price"
  order?: string;       // "asc" | "desc"
  page: number;
  limit: number;
}

export function useProductList(params: Params) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (params.category) qs.set("category", params.category);
    if (params.q) qs.set("q", params.q);
    qs.set("page", String(params.page));
    qs.set("limit", String(params.limit));

    let active = true;
    setLoading(true);
    fetchClient<{ data?: { pagination?: Pagination } }>(`/api/products?${qs.toString()}`)
      .then((res) => {
        if (!active) return;
        setProducts(toArray<Product>(res));
        setPagination((res as any)?.data?.pagination ?? null);
      })
      .catch(() => { if (active) { setProducts([]); setPagination(null); } })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.category, params.q, params.page, params.limit]);

  return { products, pagination, loading };
}