import clsx from "clsx";
import Link from "next/link";
import { useCallback } from "react";

import { InfiniteLoading } from "~/components/InfiniteLoading";
import { SortFilter } from "~/components/SortFilter";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { useResults } from "~/hooks/useResults";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import { useSearchProjects } from "../hooks/useProjects";
import { EProjectState } from "../types";

import { ProjectItem, ProjectItemAwarded } from "./ProjectItem";

export const Projects = (): JSX.Element => {
  const projects = useSearchProjects();
  const appState = useAppState();
  const { pollData, pollId, isRegistered } = useMaci();
  const { addToBallot, removeFromBallot, ballotContains, ballot } = useBallot();
  const results = useResults(pollData);

  const handleAction = useCallback(
    (projectId: string) => (e: Event) => {
      e.preventDefault();

      if (!pollId) {
        return;
      }

      if (!ballotContains(projectId)) {
        addToBallot(
          [
            {
              projectId,
              amount: 0,
            },
          ],
          pollId,
        );
      } else {
        removeFromBallot(projectId);
      }
    },
    [ballotContains, addToBallot, removeFromBallot, pollId],
  );

  const defineState = (projectId: string): EProjectState => {
    if (!isRegistered) {
      return EProjectState.UNREGISTERED;
    }
    if (ballotContains(projectId) && ballot.published) {
      return EProjectState.SUBMITTED;
    }
    if (ballotContains(projectId) && !ballot.published) {
      return EProjectState.ADDED;
    }
    return EProjectState.DEFAULT;
  };

  return (
    <div>
      <div className="flex justify-between">
        <h3>Projects</h3>

        <div>
          <SortFilter />
        </div>
      </div>

      <InfiniteLoading
        {...projects}
        renderItem={(item, { isLoading }) => (
          <Link
            key={item.id}
            className={clsx("relative", { "animate-pulse": isLoading })}
            href={`/projects/${item.id}`}
          >
            {!results.isLoading && appState === EAppState.RESULTS ? (
              <ProjectItemAwarded amount={results.data?.projects[item.id]?.votes} />
            ) : null}

            <ProjectItem
              action={handleAction(item.id)}
              attestation={item}
              isLoading={isLoading}
              state={defineState(item.id)}
            />
          </Link>
        )}
      />
    </div>
  );
};
