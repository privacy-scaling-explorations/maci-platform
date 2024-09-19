import { createCachedFetch } from "./fetch";

// ipfs data never changes
const ttl = 2147483647;
const cachedFetch = createCachedFetch({ ttl });

export async function fetchMetadata<T>(url: string): Promise<{ data: T; error: Error }> {
  console.log("url", url)
  const ipfsGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "https://dweb.link/ipfs/";

  if (!url.startsWith("http")) {
    const  x =  await cachedFetch<T>(`${ipfsGateway}${url}`);
    console.log("x", x)
    return x 
  }

  const d= await cachedFetch<T>(url);
  console.log("d", d)
  return d 
}
