import { type DefaultError, type UseMutationResult, useMutation } from "@tanstack/react-query";

import { api } from "~/utils/api";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";

export function useMetadata<T>(metadataPtr?: string): UseTRPCQueryResult<T, unknown> {
  return api.metadata.get.useQuery({ metadataPtr: String(metadataPtr) }, { enabled: Boolean(metadataPtr) });
}

/**
 * Upload metadata to Vercel blob storage
 *
 * @returns the url of the uploaded metadata file
 */
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
        return (await r.json()) as { url: string };
      });
    },
  });
}
