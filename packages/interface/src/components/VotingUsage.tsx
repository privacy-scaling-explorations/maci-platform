import clsx from "clsx";
import { useMemo } from "react";

import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";

export const VotingUsage = (): JSX.Element => {
  const { initialVoiceCredits } = useMaci();
  const { ballot, sumBallot } = useBallot();

  const sum = useMemo(() => sumBallot(ballot.votes), [sumBallot, ballot]);

  return (
    <div className="mt-4 flex flex-col gap-2">
      <h4>Voting Power</h4>

      <div>
        <p className="text-2xl">
          <b>{initialVoiceCredits}</b>
        </p>

        <p className="text-xs text-gray-400">Votes Left</p>
      </div>

      <div>
        <p className={clsx("text-2xl", sum > initialVoiceCredits && "text-red")}>
          <b>{sum}</b>
        </p>

        <p className="text-xs text-gray-400">Votes Used</p>
      </div>
    </div>
  );
};
