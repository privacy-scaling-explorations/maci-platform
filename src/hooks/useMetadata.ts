import { type DefaultError, type UseMutationResult, useMutation } from "@tanstack/react-query";

import { api } from "~/utils/api";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";

export function useMetadata<T>(metadataPtr?: string): UseTRPCQueryResult<T, unknown> {
  return api.metadata.get.useQuery({ metadataPtr: String(metadataPtr) }, { enabled: Boolean(metadataPtr) });
}

export function useUploadMetadata(): UseMutationResult<{ url: string }, DefaultError, Record<string, unknown> | File> {
  return useMutation({
    mutationFn: async (data: Record<string, unknown> | File) => {
      const formData = new FormData();

      if (!(data instanceof File)) {
        const blob = new Blob([JSON.stringify(data)], {
          type: "application/json",
        });

        formData.append("file", new File([blob], "metadata.json"));
      } else {
        formData.append("file", data);
      }

      return fetch(`/api/blob?filename=${data instanceof File ? data.name : "metadata.json"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: formData,
      }).then(async (r) => {
        if (!r.ok) {
          throw new Error("Network error");
        }
        return (await r.json()) as { url: string };
      });
    },
  });
}
