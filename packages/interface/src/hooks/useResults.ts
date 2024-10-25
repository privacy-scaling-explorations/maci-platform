import { Chain } from "viem";

import { config } from "~/config";
import { api } from "~/utils/api";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { UseTRPCInfiniteQueryResult, UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { IRecipient } from "~/utils/types";

export function useResults(
  roundId: string,
  registryAddress: string,
  tallyFile?: string,
): UseTRPCQueryResult<{ averageVotes: number; projects: Record<string, { votes: number; voters: number }> }, unknown> {
  const roundState = useRoundState(roundId);

  return api.results.votes.useQuery({ registryAddress, tallyFile }, { enabled: roundState === ERoundState.RESULTS });
}

const seed = 0;
export function useProjectsResults(
  roundId: string,
  registryAddress: string,
): UseTRPCInfiniteQueryResult<IRecipient[], unknown, unknown> {
  return api.results.projects.useInfiniteQuery(
    { roundId, registryAddress, limit: config.pageSize, seed },
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
  roundId: string,
  tallyFile?: string,
): UseTRPCQueryResult<{ amount: number }, unknown> {
  const appState = useRoundState(roundId);

  return api.results.project.useQuery(
    { id, registryAddress, tallyFile },
    { enabled: appState === ERoundState.RESULTS },
  );
}
