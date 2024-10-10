import { useState, useMemo } from "react";
import { useHarmonicIntervalFn } from "react-use";

import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";
import { calculateTimeLeft } from "~/utils/time";

import { TimeSlot } from "./TimeSlot";

interface IVotingInfoProps {
  roundId: string;
}

export const VotingInfo = ({ roundId }: IVotingInfoProps): JSX.Element => {
  const { isLoading } = useMaci();
  const { getRoundByRoundId } = useRound();
  const [timeLeft, setTimeLeft] = useState<[number, number, number, number]>([0, 0, 0, 0]);

  const votingEndsAt = useMemo(() => {
    const round = getRoundByRoundId(roundId);
    return round?.votingEndsAt ? new Date(round.votingEndsAt) : new Date();
  }, [getRoundByRoundId, roundId]);

  useHarmonicIntervalFn(() => {
    setTimeLeft(calculateTimeLeft(votingEndsAt));
  }, 1000);

  return (
    <div className="w-full py-4">
      <h4 className="mb-2">Voting Ends In</h4>

      {isLoading && <p>Loading...</p>}

      {!isLoading && timeLeft[3] < 0 && <p>Voting has ended</p>}

      {!isLoading && timeLeft[3] > 0 && (
        <div className="flex gap-2">
          <TimeSlot num={timeLeft[0]} unit="Days" />

          <TimeSlot num={timeLeft[1]} unit="Hours" />

          <TimeSlot num={timeLeft[2]} unit="Minutes" />

          <TimeSlot num={timeLeft[3]} unit="Seconds" />
        </div>
      )}
    </div>
  );
};
