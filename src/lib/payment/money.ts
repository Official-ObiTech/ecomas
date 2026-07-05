export function formatNaira(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(kobo / 100);
}

// naira (what the admin types) -> kobo (what we store)
export function nairaToKobo(naira: number | string): number {
  const n = typeof naira === "string" ? parseFloat(naira) : naira;
  return Math.round((Number.isFinite(n) ? n : 0) * 100);
}

// kobo -> plain naira number (for prefilling the edit form, no ₦ symbol)
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}