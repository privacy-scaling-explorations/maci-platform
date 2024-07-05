import { ipfs } from "~/config";

import { createCachedFetch } from "./fetch";

// ipfs data never changes
const ttl = 2147483647;
const cachedFetch = createCachedFetch({ ttl });

export async function fetchMetadata<T>(url: string): Promise<{ data: T; error: Error }> {
  if (!url.startsWith("http")) {
    return cachedFetch<T>(`${ipfs.fetchingUrl}${url}`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${ipfs.apiKey}:${ipfs.secret}`).toString("base64")}`,
      },
    });
  }

  return cachedFetch<T>(url);
}
