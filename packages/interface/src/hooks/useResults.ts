import { config } from "~/config";
import { api } from "~/utils/api";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { UseTRPCInfiniteQueryResult, UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { IGetPollData } from "maci-cli/sdk";
import type { Attestation } from "~/utils/types";

export function useResults(
  roundId: string,
  pollData?: IGetPollData,
): UseTRPCQueryResult<{ averageVotes: number; projects: Record<string, { votes: number; voters: number }> }, unknown> {
  const roundState = useRoundState(roundId);

  return api.results.votes.useQuery(
    { roundId, pollId: pollData?.id.toString() },
    { enabled: roundState === ERoundState.RESULTS },
  );
}

const seed = 0;
export function useProjectsResults(
  roundId: string,
  pollData?: IGetPollData,
): UseTRPCInfiniteQueryResult<Attestation[], unknown, unknown> {
  return api.results.projects.useInfiniteQuery(
    { roundId, limit: config.pageSize, seed, pollId: pollData?.id.toString() },
    {
      getNextPageParam: (_, pages) => pages.length,
    },
  );
}

export function useProjectCount(roundId: string): UseTRPCQueryResult<{ count: number }, unknown> {
  return api.projects.count.useQuery({ roundId });
}

export function useProjectResults(
  id: string,
  roundId: string,
  pollData?: IGetPollData,
): UseTRPCQueryResult<{ amount: number }, unknown> {
  const appState = useRoundState(roundId);

  return api.results.project.useQuery(
    { id, roundId, pollId: pollData?.id.toString() },
    { enabled: appState === ERoundState.RESULTS },
  );
}
