import clsx from "clsx";
import { useMemo } from "react";

import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";

interface IVotingUsageProps {
  pollId: string;
}

export const VotingUsage = ({ pollId }: IVotingUsageProps): JSX.Element => {
  const { initialVoiceCredits } = useMaci();
  const { getBallot, sumBallot } = useBallot();

  const ballot = getBallot(pollId);
  const sum = useMemo(() => sumBallot(ballot.votes), [sumBallot, ballot]);

  return (
    <div className="mt-4 flex flex-col gap-2">
      <h4 className="font-sans text-base font-normal uppercase text-gray-400">Voting Power</h4>

      <div>
        <div className="flex gap-1 font-sans text-2xl font-extrabold">
          <span className={clsx(sum > initialVoiceCredits && "text-red")}>{sum}</span>

          <span className="text-gray-300">{`of ${initialVoiceCredits}`}</span>
        </div>

        <span className="font-sans text-base font-normal uppercase text-gray-400">Votes Used</span>
      </div>
    </div>
  );
};
