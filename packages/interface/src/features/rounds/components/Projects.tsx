import clsx from "clsx";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Hex, zeroAddress } from "viem";

import { InfiniteLoading } from "~/components/InfiniteLoading";
import { SortFilter } from "~/components/SortFilter";
import { StatusBar } from "~/components/StatusBar";
import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";
import { useResults } from "~/hooks/useResults";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import { ProjectItem, ProjectItemAwarded } from "../../projects/components/ProjectItem";
import { useSearchProjects } from "../../projects/hooks/useProjects";
import { EProjectState } from "../../projects/types";

export interface IProjectsProps {
  pollId?: string;
}

export const Projects = ({ pollId = "" }: IProjectsProps): JSX.Element => {
  const roundState = useRoundState({ pollId });

  const { getRoundByPollId } = useRound();
  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);

  const projects = useSearchProjects({ pollId, search: "", registryAddress: round?.registryAddress ?? zeroAddress });

  const { isRegistered } = useMaci();
  const { addToBallot, removeFromBallot, ballotContains, getBallot } = useBallot();

  const results = useResults(
    pollId,
    (round?.registryAddress ?? zeroAddress) as Hex,
    (round?.tallyAddress ?? zeroAddress) as Hex,
  );

  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);

  const handleAction = useCallback(
    (projectIndex: number, projectId: string) => (e: Event) => {
      e.preventDefault();

      if (!pollId) {
        return;
      }

      if (!ballotContains(projectIndex, pollId)) {
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
        removeFromBallot(projectIndex, pollId);
      }
    },
    [ballotContains, addToBallot, removeFromBallot, pollId],
  );

  const defineState = (projectIndex: number): EProjectState => {
    if (!isRegistered) {
      return EProjectState.UNREGISTERED;
    }
    if (ballotContains(projectIndex, pollId) && ballot.published && !ballot.edited) {
      return EProjectState.SUBMITTED;
    }
    if (ballotContains(projectIndex, pollId)) {
      return EProjectState.ADDED;
    }
    return EProjectState.DEFAULT;
  };

  return (
    <div>
      {roundState === ERoundState.APPLICATION && (
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

      {(roundState === ERoundState.TALLYING || roundState === ERoundState.RESULTS) && (
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

      <div className="mb-4 flex flex-col justify-between sm:flex-row">
        <Heading as="h3" size="3xl">
          Projects
        </Heading>

        <div>
          <SortFilter />
        </div>
      </div>

      {roundState === ERoundState.APPLICATION && (
        <div className="mb-4 flex w-full justify-end">
          <Link href={`/rounds/${pollId}/applications/new`}>
            <Button size="auto" variant="primary">
              Create Application
            </Button>
          </Link>
        </div>
      )}

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
              action={handleAction(Number.parseInt(item.index, 10), item.id)}
              isLoading={projects.isLoading}
              pollId={pollId}
              recipient={item}
              state={defineState(Number.parseInt(item.index, 10))}
            />
          </Link>
        )}
      />
    </div>
  );
};
