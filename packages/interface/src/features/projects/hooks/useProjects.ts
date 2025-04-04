import { Chain, Hex } from "viem";

import { type Metadata } from "~/features/proposals/types";
import { useMetadata } from "~/hooks/useMetadata";
import { api } from "~/utils/api";

import type { UseTRPCInfiniteQueryResult, UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { IRecipient } from "~/utils/types";

interface IUseSearchProjectsProps {
  pollId: string;
  search: string;
  registryAddress: string;
}

export function useProjectById(id: string, registryAddress: string): UseTRPCQueryResult<IRecipient, unknown> {
  return api.projects.get.useQuery({ ids: [id], registryAddress }, { enabled: Boolean(id) });
}

export function useProjectsById(ids: string[], registryAddress: string): UseTRPCQueryResult<IRecipient[], unknown> {
  return api.projects.get.useQuery({ ids, registryAddress }, { enabled: Boolean(ids.length) });
}

export function useSearchProjects({
  search,
  registryAddress,
}: IUseSearchProjectsProps): UseTRPCInfiniteQueryResult<IRecipient[], unknown, unknown> {
  return api.projects.search.useInfiniteQuery(
    { search, registryAddress },
    {
      getNextPageParam: (_, pages) => pages.length,
    },
  );
}

export function useProjectMetadata(metadataPtr?: string): UseTRPCQueryResult<Metadata, unknown> {
  return useMetadata<Metadata>(metadataPtr);
}

export function useApprovedProjectByRecipientIndex(
  registryAddress: string,
  recipientIndex: string,
): UseTRPCQueryResult<IRecipient[], unknown> {
  return api.projects.getApprovedByIndex.useQuery({ registryAddress, index: recipientIndex });
}

export function useProjectCount({
  chain,
  registryAddress,
}: {
  chain: Chain;
  registryAddress: Hex;
}): UseTRPCQueryResult<{ count: number }, unknown> {
  return api.projects.count.useQuery({ chain, registryAddress });
}
