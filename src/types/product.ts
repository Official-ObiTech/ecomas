export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;          // kobo
  compareAtPrice?: number | null; // kobo
  stock: number;
  images: string[];
  featured?: boolean;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  category?: { id: string; name: string; slug: string } | null;
}