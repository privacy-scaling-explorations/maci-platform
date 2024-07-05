import { type DefaultError, type UseMutationResult, useMutation } from "@tanstack/react-query";

import { api } from "~/utils/api";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";

export function useMetadata<T>(metadataPtr?: string): UseTRPCQueryResult<T, unknown> {
  return api.metadata.get.useQuery({ metadataPtr: String(metadataPtr) }, { enabled: Boolean(metadataPtr) });
}

// based on API documentation of infura and pinata the hash could come
// with different property names
interface UploadResponse {
  Hash?: string;
  IpfsHash?: string;
}

export function useUploadMetadata(): UseMutationResult<{ url: string }, DefaultError, Record<string, unknown> | File> {
  return useMutation({
    mutationFn: async (data: Record<string, unknown> | File) => {
      let uploadData;
      if (!(data instanceof File)) {
        const blob = new Blob([JSON.stringify(data)], {
          type: "application/json",
        });

        uploadData = new File([blob], "metadata.json");
      } else {
        uploadData = data;
      }

      return fetch(`/api/blob?filename=${uploadData.name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: uploadData,
      }).then(async (r) => {
        if (!r.ok) {
          throw new Error("Network error");
        }
        const res = (await r.json()) as unknown as UploadResponse;
        const hash = res.Hash ?? res.IpfsHash;
        return { url: hash! };
      });
    },
  });
}
