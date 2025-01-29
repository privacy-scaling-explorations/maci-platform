import { config } from "~/config";
import { api } from "~/utils/api";

import type { UseTRPCInfiniteQueryResult, UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { IRecipient } from "~/utils/types";

const seed = 0;
export function useProjects(registryAddress: string): UseTRPCInfiniteQueryResult<IRecipient[], unknown, unknown> {
  return api.projects.projects.useInfiniteQuery(
    { registryAddress, limit: config.pageSize, seed },
    {
      getNextPageParam: (_, pages) => pages.length,
    },
  );
}

export function useMyProjects(registryAddress: string, address: string): UseTRPCQueryResult<IRecipient[], unknown> {
  return api.projects.getMine.useQuery({ registryAddress, address });
}
