import { Chain } from "viem";

import { config } from "~/config";
import { api } from "~/utils/api";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { UseTRPCInfiniteQueryResult, UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { IRecipient } from "~/utils/types";

export function useResults(
  pollId: string,
  registryAddress: string,
  tallyFile?: string,
): UseTRPCQueryResult<{ averageVotes: number; projects: Record<string, { votes: number; voters: number }> }, unknown> {
  const roundState = useRoundState(pollId);

  return api.results.votes.useQuery({ registryAddress, tallyFile }, { enabled: roundState === ERoundState.RESULTS });
}

const seed = 0;
export function useProjectsResults(
  registryAddress: string,
): UseTRPCInfiniteQueryResult<IRecipient[], unknown, unknown> {
  return api.results.projects.useInfiniteQuery(
    { registryAddress, limit: config.pageSize, seed },
    {
      getNextPageParam: (_, pages) => pages.length,
    },
  );
}

export function useProjectCount(registryAddress: string, chain: Chain): UseTRPCQueryResult<{ count: number }, unknown> {
  return api.projects.count.useQuery({ registryAddress, chain });
}

export function useProjectResults(
  id: string,
  registryAddress: string,
  pollId: string,
  tallyFile?: string,
): UseTRPCQueryResult<{ amount: number }, unknown> {
  const appState = useRoundState(pollId);

  return api.results.project.useQuery(
    { id, registryAddress, tallyFile },
    { enabled: appState === ERoundState.RESULTS },
  );
}
