import clsx from "clsx";
import Link from "next/link";

import { InfiniteLoading } from "~/components/InfiniteLoading";
import { useSearchProjects } from "../hooks/useProjects";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";
import { EProjectState } from "../types";
import { useResults } from "~/hooks/useResults";
import { SortFilter } from "~/components/SortFilter";
import { ProjectItem, ProjectItemAwarded } from "./ProjectItem";
import { useMaci } from "~/contexts/Maci";
import { useBallot } from "~/contexts/Ballot";

export const Projects = (): JSX.Element => {
  const projects = useSearchProjects();
  const appState = useAppState();
  const { pollData, pollId, isRegistered } = useMaci();
  const { addToBallot, removeFromBallot, ballotContains, ballot } = useBallot();
  const results = useResults(pollData);

  const handleAction = (e: Event, projectId: string) => {
    e.preventDefault();

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
  };

  const defineState = (projectId: string): EProjectState => {
    if (!isRegistered) return EProjectState.UNREGISTERED;
    else if (ballotContains(projectId) && ballot?.published)
      return EProjectState.SUBMITTED;
    else if (ballotContains(projectId) && !ballot?.published)
      return EProjectState.ADDED;
    else return EProjectState.DEFAULT;
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
        renderItem={(item, { isLoading }) => {
          return (
            <Link
              key={item.id}
              href={`/projects/${item.id}`}
              className={clsx("relative", { ["animate-pulse"]: isLoading })}
            >
              {!results.isLoading && appState === EAppState.RESULTS ? (
                <ProjectItemAwarded
                  amount={results.data?.projects?.[item.id]?.votes}
                />
              ) : null}
              <ProjectItem
                isLoading={isLoading}
                attestation={item}
                state={defineState(item.id)}
                action={(e: Event) => handleAction(e, item.id)}
              />
            </Link>
          );
        }}
      />
    </div>
  );
};
