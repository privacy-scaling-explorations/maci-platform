import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { useBallot } from "~/contexts/Ballot";
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

  const showButton = useMemo(() => !asPath.includes("ballot"), [asPath]);

  return (
    <Link
      href={
        ballot.published && (roundState === ERoundState.TALLYING || roundState === ERoundState.RESULTS)
          ? `/rounds/${pollId}/ballot/confirmation`
          : `/rounds/${pollId}/ballot`
      }
    >
      <div className="dark:bg-lightBlack w-64 flex-col items-center gap-2 bg-white uppercase dark:text-white">
        <Heading as="h3" size="3xl">
          {title}
        </Heading>

        <AddedProjects pollId={pollId} />

        <VotingUsage pollId={pollId} />

        {showButton && (
          <Button className="mt-2" variant="secondary">
            Check My Ballot
          </Button>
        )}
      </div>
    </Link>
  );
};
