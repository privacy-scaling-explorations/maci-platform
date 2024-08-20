import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback } from "react";

import { InfiniteLoading } from "~/components/InfiniteLoading";
import { useMaci } from "~/contexts/Maci";
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
  const { pollData } = useMaci();
  const projects = useProjectsResults(roundId, pollData);
  const results = useResults(roundId);
  const roundState = useRoundState(roundId);

  const handleAction = useCallback(
    (projectId: string) => (e: Event) => {
      e.preventDefault();
      router.push(`/projects/${projectId}`);
    },
    [router],
  );

  return (
    <InfiniteLoading
      {...projects}
      renderItem={(item, { isLoading }) => (
        <Link key={item.id} className={clsx("relative", { "animate-pulse": isLoading })} href={`/projects/${item.id}`}>
          {!results.isLoading && roundState === ERoundState.RESULTS ? (
            <ProjectItemAwarded amount={results.data?.projects[item.id]?.votes} />
          ) : null}

          <ProjectItem
            action={handleAction(item.id)}
            attestation={item}
            isLoading={isLoading}
            roundId={roundId}
            state={EProjectState.SUBMITTED}
          />
        </Link>
      )}
    />
  );
};
