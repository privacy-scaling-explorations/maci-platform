import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";
import { type Hex, zeroAddress } from "viem";

import { InfiniteLoading } from "~/components/InfiniteLoading";
import { useRound } from "~/contexts/Round";
import { useResults, useProjectsResults } from "~/hooks/useResults";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import { EProjectState } from "../types";

import { ProjectItem, ProjectItemAwarded } from "./ProjectItem";

interface IProjectsResultsProps {
  roundId: string;
}

export const ProjectsResults = ({ roundId }: IProjectsResultsProps): JSX.Element => {
  const router = useRouter();
  const { getRoundByRoundId } = useRound();
  const round = useMemo(() => getRoundByRoundId(roundId), [roundId, getRoundByRoundId]);
  const projects = useProjectsResults(roundId, (round?.registryAddress ?? zeroAddress) as Hex);
  const results = useResults(roundId, (round?.registryAddress ?? zeroAddress) as Hex, round?.tallyFile);
  const roundState = useRoundState(roundId);

  const handleAction = useCallback(
    (projectId: string) => (e: Event) => {
      e.preventDefault();
      router.push(`/rounds/${roundId}/projects/${projectId}`);
    },
    [router, roundId],
  );

  return (
    <InfiniteLoading
      {...projects}
      renderItem={(item, { isLoading }) => (
        <Link
          key={item.id}
          className={clsx("relative", { "animate-pulse": isLoading })}
          href={`/rounds/${roundId}/${item.id}`}
        >
          {!results.isLoading && roundState === ERoundState.RESULTS ? (
            <ProjectItemAwarded amount={results.data?.projects[item.id]?.votes} />
          ) : null}

          <ProjectItem
            action={handleAction(item.id)}
            isLoading={isLoading}
            recipient={item}
            roundId={roundId}
            state={EProjectState.SUBMITTED}
          />
        </Link>
      )}
    />
  );
};
