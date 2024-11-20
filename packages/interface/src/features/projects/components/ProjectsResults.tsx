import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";
import { type Hex, zeroAddress } from "viem";

import { InfiniteLoading } from "~/components/InfiniteLoading";
import { useRound } from "~/contexts/Round";
import { useProjects } from "~/hooks/useProjects";
import { useResults } from "~/hooks/useResults";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import { EProjectState } from "../types";

import { ProjectItem, ProjectItemAwarded } from "./ProjectItem";

interface IProjectsResultsProps {
  pollId: string;
}

export const ProjectsResults = ({ pollId }: IProjectsResultsProps): JSX.Element => {
  const router = useRouter();
  const { getRoundByPollId } = useRound();
  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);
  const projects = useProjects((round?.registryAddress ?? zeroAddress) as Hex);
  const results = useResults(
    pollId,
    (round?.registryAddress ?? zeroAddress) as Hex,
    (round?.tallyAddress ?? zeroAddress) as Hex,
  );
  const roundState = useRoundState({ pollId });

  const handleAction = useCallback(
    (projectId: string) => (e: Event) => {
      e.preventDefault();
      router.push(`/rounds/${pollId}/projects/${projectId}`);
    },
    [router, pollId],
  );

  return (
    <InfiniteLoading
      {...projects}
      renderItem={(item, { isLoading }) => (
        <Link
          key={item.id}
          className={clsx("relative", { "animate-pulse": isLoading })}
          href={`/rounds/${pollId}/${item.id}`}
        >
          {!results.isLoading && roundState === ERoundState.RESULTS ? (
            <ProjectItemAwarded amount={results.data?.projects[item.id]?.votes} />
          ) : null}

          <ProjectItem
            action={handleAction(item.id)}
            isLoading={isLoading}
            pollId={pollId}
            recipient={item}
            state={EProjectState.SUBMITTED}
          />
        </Link>
      )}
    />
  );
};
