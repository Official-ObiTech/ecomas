import { useEffect, useState } from "react";
import { fetchClient, toArray } from "@/lib/fetchClient";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchClient<unknown>("/api/categories")
      .then((res) => { if (active) setCategories(toArray<Category>(res)); })
      .catch(() => { if (active) setCategories([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { categories, loading };
}