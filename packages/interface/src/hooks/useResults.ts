import { Chain } from "viem";

import { api } from "~/utils/api";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { IRecipientWithVotes, Tally } from "~/utils/types";

export function useResults(
  pollId: string,
  registryAddress: string,
  tallyAddress: string,
): UseTRPCQueryResult<{ averageVotes: number; projects: Record<string, { votes: number; voters: number }> }, unknown> {
  const roundState = useRoundState({ pollId });

  return api.results.votes.useQuery({ registryAddress, tallyAddress }, { enabled: roundState === ERoundState.RESULTS });
}

export function useProjectsResults(
  registryAddress: string,
  tallyAddress: string,
): UseTRPCQueryResult<IRecipientWithVotes[], unknown> {
  return api.results.projects.useQuery({ registryAddress, tallyAddress });
}

export function useProjectCount(registryAddress: string, chain: Chain): UseTRPCQueryResult<{ count: number }, unknown> {
  return api.projects.count.useQuery({ registryAddress, chain });
}

export function useProjectResults(
  id: string,
  registryAddress: string,
  pollId: string,
  tallyAddress: string,
): UseTRPCQueryResult<{ amount: number }, unknown> {
  const roundState = useRoundState({ pollId });

  return api.results.project.useQuery(
    { id, registryAddress, tallyAddress },
    { enabled: roundState === ERoundState.RESULTS },
  );
}

export function useIsTallied(tallyAddress: string): UseTRPCQueryResult<{ isTallied: boolean }, unknown> {
  return api.maci.isTallied.useQuery({ tallyAddress });
}

export function useFetchTallies(): UseTRPCQueryResult<{ tallies: Tally[] }, unknown> {
  return api.maci.tallies.useQuery();
}
