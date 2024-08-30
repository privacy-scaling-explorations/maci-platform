import clsx from "clsx";
import Link from "next/link";
import { useCallback } from "react";
import { FiAlertCircle } from "react-icons/fi";

import { InfiniteLoading } from "~/components/InfiniteLoading";
import { SortFilter } from "~/components/SortFilter";
import { StatusBar } from "~/components/StatusBar";
import { Heading } from "~/components/ui/Heading";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { useResults } from "~/hooks/useResults";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import { ProjectItem, ProjectItemAwarded } from "../../projects/components/ProjectItem";
import { useSearchProjects } from "../../projects/hooks/useProjects";
import { EProjectState } from "../../projects/types";

export interface IProjectsProps {
  roundId?: string;
}

export const Projects = ({ roundId = "" }: IProjectsProps): JSX.Element => {
  const appState = useRoundState(roundId);
  const projects = useSearchProjects({ roundId, needApproval: appState !== ERoundState.APPLICATION });

  const { pollData, pollId, isRegistered } = useMaci();
  const { addToBallot, removeFromBallot, ballotContains, ballot } = useBallot();
  const results = useResults(roundId, pollData);

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
    if (ballotContains(projectId) && ballot.published && !ballot.edited) {
      return EProjectState.SUBMITTED;
    }
    if (ballotContains(projectId)) {
      return EProjectState.ADDED;
    }
    return EProjectState.DEFAULT;
  };

  return (
    <div>
      {appState === ERoundState.APPLICATION && (
        <StatusBar
          content={
            <div className="flex items-center gap-2">
              <FiAlertCircle className="h-4 w-4" />
              Voting is enabled until Registration period ends.
            </div>
          }
          status="default"
        />
      )}

      {(appState === ERoundState.TALLYING || appState === ERoundState.RESULTS) && (
        <StatusBar
          content={
            <div className="flex items-center gap-2">
              <FiAlertCircle className="h-4 w-4" />
              Voting already ended, you cannot vote anymore.
            </div>
          }
          status="default"
        />
      )}

      <div className="mb-4 flex justify-between">
        <Heading as="h3" size="3xl">
          Projects
        </Heading>

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
            href={`/rounds/${roundId}/${item.id}`}
          >
            {!results.isLoading && appState === ERoundState.RESULTS ? (
              <ProjectItemAwarded amount={results.data?.projects[item.id]?.votes} />
            ) : null}

            <ProjectItem
              action={handleAction(item.id)}
              attestation={item}
              isLoading={isLoading}
              roundId={roundId}
              state={defineState(item.id)}
            />
          </Link>
        )}
      />
    </div>
  );
};
