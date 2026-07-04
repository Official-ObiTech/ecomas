import { toast } from "sonner";
import { logger } from "@/lib/logger";

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  // notifications — handled HERE, the single place
  notify?: boolean;        // toast on success AND error
  notifyError?: boolean;   // toast on error only (default true for writes? see below)
  successMessage?: string; // override the server's success message
  silent?: boolean;        // force no toast at all
};

export async function fetchClient<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    body,
    headers,
    notify = false,
    notifyError = false,
    successMessage,
    silent = false,
    ...rest
  } = options;

  try {
    const res = await fetch(path, {
      ...rest,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

    if (!res.ok || json?.success === false) {
      throw new Error(json?.message || `Request failed (${res.status})`);
    }

    // success toast — only if asked, never when silent
    if (!silent && notify) {
      toast.success(successMessage || json?.message || "Success");
    }

    return json as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    logger.error(`[fetchClient] ${path}`, err);

    // error toast — the one place errors surface to the user
    if (!silent && (notify || notifyError)) {
      toast.error(message);
    }

    throw err instanceof Error ? err : new Error(message);
  }
}

export function toArray<T>(res: unknown): T[] {
  const candidates = [
    res,
    (res as any)?.data,
    (res as any)?.data?.data,
    (res as any)?.data?.items,
  ];
  const hit = candidates.find(Array.isArray);
  return (hit as T[]) ?? [];
}