import { useMemo } from "react";

import { type Application } from "~/features/applications/types";
import { useFilter } from "~/features/filter/hooks/useFilter";
import { type Filter } from "~/features/filter/types";
import { useMetadata } from "~/hooks/useMetadata";
import { api } from "~/utils/api";

import type { UseTRPCInfiniteQueryResult, UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { Ballot } from "~/features/ballot/types";
import type { Attestation } from "~/utils/types";

interface IUseSearchProjectsProps {
  roundId: string;
  filterOverride?: Partial<Filter>;
  needApproval?: boolean;
}

export function useProjectById(id: string): UseTRPCQueryResult<Attestation[], unknown> {
  return api.projects.get.useQuery({ ids: [id] }, { enabled: Boolean(id) });
}

export function useProjectsById(ids: string[]): UseTRPCQueryResult<Attestation[], unknown> {
  return api.projects.get.useQuery({ ids }, { enabled: Boolean(ids.length) });
}

const seed = 0;
export function useSearchProjects({
  roundId,
  filterOverride = {},
  needApproval = true,
}: IUseSearchProjectsProps): UseTRPCInfiniteQueryResult<Attestation[], unknown, unknown> {
  const { ...filter } = useFilter();

  return api.projects.search.useInfiniteQuery(
    { roundId, seed, ...filter, ...filterOverride, needApproval },
    {
      getNextPageParam: (_, pages) => pages.length,
    },
  );
}

export function useProjectIdMapping(ballot: Ballot, roundId: string): Record<string, number> {
  const { data } = api.projects.allApproved.useQuery({ roundId });

  const projectIndices = useMemo(
    () =>
      ballot.votes.reduce<Record<string, number>>((acc, { projectId }) => {
        const index = data?.findIndex((attestation) => attestation.id.toLowerCase() === projectId.toLowerCase());
        acc[projectId] = index ?? -1;

        return acc;
      }, {}),
    [data, ballot],
  );

  return projectIndices;
}

export function useProjectMetadata(metadataPtr?: string): UseTRPCQueryResult<Application, unknown> {
  return useMetadata<Application>(metadataPtr);
}

export function useProjectCount(roundId: string): UseTRPCQueryResult<{ count: number }, unknown> {
  return api.projects.count.useQuery({ roundId });
}
