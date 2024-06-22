import NodeFetchCache, { MemoryCache } from "node-fetch-cache";

export interface ICreateCachedFetchArgs {
  ttl?: number;
}

export type TCachedFetch = <T>(
  url: string,
  opts?: { method: "POST" | "GET"; body?: string },
) => Promise<{ data: T; error: Error }>;

export function createCachedFetch({ ttl = 1000 * 60 }: ICreateCachedFetchArgs): TCachedFetch {
  const cachedFetch = NodeFetchCache.create({ cache: new MemoryCache({ ttl }) });

  return async <T>(url: string, opts?: { method: "POST" | "GET"; body?: string }): Promise<{ data: T; error: Error }> =>
    cachedFetch(url, {
      method: opts?.method ?? "GET",
      body: opts?.body,
      headers: { "Content-Type": "application/json" },
    }).then(async (r) => {
      if (!r.ok) {
        await r.ejectFromCache();
        throw new Error("Network error");
      }

      return (await r.json()) as { data: T; error: Error };
    });
}
