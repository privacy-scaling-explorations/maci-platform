import { zeroAddress } from "viem";

import { api } from "~/utils/api";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import type { UseTRPCInfiniteQueryResult, UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { IPollData, IRecipient } from "~/utils/types";

export function useResults(
  pollData?: IPollData,
): UseTRPCQueryResult<{ averageVotes: number; projects: Record<string, { votes: number; voters: number }> }, unknown> {
  const appState = useAppState();

  return api.results.votes.useQuery(
    { pollId: pollData?.id.toString(), registryAddress: pollData?.registry ?? zeroAddress },
    { enabled: appState === EAppState.RESULTS },
  );
}

export function useProjectsResults(pollData?: IPollData): UseTRPCInfiniteQueryResult<IRecipient[], unknown, unknown> {
  return api.results.projects.useInfiniteQuery(
    { registryAddress: pollData?.registry ?? zeroAddress },
    {
      getNextPageParam: (_, pages) => pages.length,
    },
  );
}

export function useProjectResults(id: string, pollData?: IPollData): UseTRPCQueryResult<{ amount: number }, unknown> {
  const appState = useAppState();

  return api.results.project.useQuery(
    { id, pollId: pollData?.id.toString(), registryAddress: pollData?.registry ?? zeroAddress },
    { enabled: appState === EAppState.RESULTS },
  );
}
