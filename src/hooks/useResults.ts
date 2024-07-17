import { config } from "~/config";
import { api } from "~/utils/api";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import type { UseTRPCInfiniteQueryResult, UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { IGetPollData } from "maci-cli/sdk";
import type { Attestation } from "~/utils/types";

export function useResults(
  pollData?: IGetPollData,
): UseTRPCQueryResult<{ averageVotes: number; projects: Record<string, { votes: number; voters: number }> }, unknown> {
  const appState = useAppState();

  return api.results.votes.useQuery({ pollId: pollData?.id.toString() }, { enabled: appState === EAppState.RESULTS });
}

const seed = 0;
export function useProjectsResults(
  pollData?: IGetPollData,
): UseTRPCInfiniteQueryResult<Attestation[], unknown, unknown> {
  return api.results.projects.useInfiniteQuery(
    { limit: config.pageSize, seed, pollId: pollData?.id.toString() },
    {
      getNextPageParam: (_, pages) => pages.length,
    },
  );
}

export function useProjectCount(): UseTRPCQueryResult<{ count: number }, unknown> {
  return api.projects.count.useQuery();
}

export function useProjectResults(
  id: string,
  pollData?: IGetPollData,
): UseTRPCQueryResult<{ amount: number }, unknown> {
  const appState = useAppState();

  return api.results.project.useQuery(
    { id, pollId: pollData?.id.toString() },
    { enabled: appState === EAppState.RESULTS },
  );
}
