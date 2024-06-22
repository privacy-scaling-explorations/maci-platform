import { createCachedFetch } from "./fetch";

// ipfs data never changes
const ttl = 2147483647;
const cachedFetch = createCachedFetch({ ttl });

export async function fetchMetadata<T>(url: string): Promise<{ data: T; error: Error }> {
  const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://dweb.link/ipfs/";

  if (!url.startsWith("http")) {
    return cachedFetch<T>(`${ipfsGateway}${url}`);
  }

  return cachedFetch<T>(url);
}
