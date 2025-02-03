import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { useBallot } from "~/contexts/Ballot";
import { AllocateEquallyButton } from "~/features/ballot/components/AllocateEquallyButton";
import { RemoveAllVotesButton } from "~/features/ballot/components/RemoveAllVotesButton";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import { AddedProjects } from "./AddedProjects";
import { VotingUsage } from "./VotingUsage";

interface IBallotOverviewProps {
  title?: string;
  pollId: string;
}

export const BallotOverview = ({ title = undefined, pollId }: IBallotOverviewProps): JSX.Element => {
  const { getBallot } = useBallot();

  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);

  const roundState = useRoundState({ pollId });

  const { asPath } = useRouter();

  const showButton = useMemo(
    () =>
      !asPath.includes("ballot") &&
      (roundState === ERoundState.VOTING ||
        ((roundState === ERoundState.TALLYING || roundState === ERoundState.RESULTS) && ballot.published)),
    [asPath],
  );

  return (
    <Link
      href={
        ballot.published && (roundState === ERoundState.TALLYING || roundState === ERoundState.RESULTS)
          ? `/rounds/${pollId}/ballot/confirmation`
          : `/rounds/${pollId}/ballot`
      }
    >
      <div className="dark:bg-lightBlack sm:w-66 w-full flex-col items-center gap-2 bg-white uppercase dark:text-white">
        <Heading as="h3" size="3xl">
          {title}
        </Heading>

        <AddedProjects pollId={pollId} />

        <VotingUsage pollId={pollId} />

        {!showButton && roundState === ERoundState.VOTING && (
          <>
            <AllocateEquallyButton pollId={pollId} />

            <p className="mt-6 text-[10px] text-gray-300">
              If votes are not equally divisible, the remainder will be distributed starting with the top item.
            </p>

            <RemoveAllVotesButton pollId={pollId} />
          </>
        )}

        {showButton && (
          <Button className="mt-2" variant="secondary">
            Check My Ballot
          </Button>
        )}
      </div>
    </Link>
  );
};
