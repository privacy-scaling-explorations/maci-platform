import clsx from "clsx";
import Link from "next/link";
import { useCallback } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { zeroAddress } from "viem";

import { InfiniteLoading } from "~/components/InfiniteLoading";
import { SortFilter } from "~/components/SortFilter";
import { StatusBar } from "~/components/StatusBar";
import { Heading } from "~/components/ui/Heading";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { useResults } from "~/hooks/useResults";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import { useSearchProjects } from "../hooks/useProjects";
import { EProjectState } from "../types";

import { ProjectItem, ProjectItemAwarded } from "./ProjectItem";

export const Projects = (): JSX.Element => {
  const appState = useAppState();

  const { pollData, pollId, isRegistered } = useMaci();
  const projects = useSearchProjects({ search: "", registryAddress: pollData?.registry ?? zeroAddress });

  const { addToBallot, removeFromBallot, ballotContains, ballot } = useBallot();
  const results = useResults(pollData);

  const handleAction = useCallback(
    (projectIndex: number, projectId: string) => (e: Event) => {
      e.preventDefault();

      if (!pollId) {
        return;
      }

      if (!ballotContains(projectIndex)) {
        addToBallot(
          [
            {
              projectIndex,
              projectId,
              amount: 0,
            },
          ],
          pollId,
        );
      } else {
        removeFromBallot(projectIndex);
      }
    },
    [ballotContains, addToBallot, removeFromBallot, pollId],
  );

  const defineState = (projectIndex: number): EProjectState => {
    if (!isRegistered) {
      return EProjectState.UNREGISTERED;
    }
    if (ballotContains(projectIndex) && ballot.published && !ballot.edited) {
      return EProjectState.SUBMITTED;
    }
    if (ballotContains(projectIndex)) {
      return EProjectState.ADDED;
    }
    return EProjectState.DEFAULT;
  };

  return (
    <div>
      {appState === EAppState.APPLICATION && (
        <StatusBar
          content={
            <div className="flex items-center gap-2">
              <FiAlertCircle className="h-4 w-4" />
              Voting is disabled until the Application period ends.
            </div>
          }
          status="default"
        />
      )}

      {appState === EAppState.TALLYING && (
        <StatusBar
          content={
            <div className="flex items-center gap-2">
              <FiAlertCircle className="h-4 w-4" />
              The voting period has ended.
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
            href={`/projects/${item.id}`}
          >
            {!results.isLoading && appState === EAppState.RESULTS ? (
              <ProjectItemAwarded amount={results.data?.projects[item.id]?.votes} />
            ) : null}

            <ProjectItem
              action={handleAction(Number.parseInt(item.index, 10), item.id)}
              isLoading={projects.isLoading}
              recipient={item}
              state={defineState(Number.parseInt(item.index, 10))}
            />
          </Link>
        )}
      />
    </div>
  );
};
