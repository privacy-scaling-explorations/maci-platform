import Link from "next/link";
import { useMemo } from "react";

import { Heading } from "~/components/ui/Heading";
import { useBallot } from "~/contexts/Ballot";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import { VotingUsage } from "./VotingUsage";

interface IBallotOverviewProps {
  title?: string;
  pollId: string;
}

export const BallotOverview = ({ title = undefined, pollId }: IBallotOverviewProps): JSX.Element => {
  const { getBallot } = useBallot();

  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);

  const roundState = useRoundState(pollId);

  return (
    <Link
      href={
        ballot.published && (roundState === ERoundState.TALLYING || roundState === ERoundState.RESULTS)
          ? `/rounds/${pollId}/ballot/confirmation`
          : `/rounds/${pollId}/ballot`
      }
    >
      <div className="dark:bg-lightBlack my-8 flex-col items-center gap-2 rounded-lg bg-white p-5 uppercase shadow-lg dark:text-white">
        <Heading as="h3" size="3xl">
          {title}
        </Heading>

        <VotingUsage pollId={pollId} />
      </div>
    </Link>
  );
};
