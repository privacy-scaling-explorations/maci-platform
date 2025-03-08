import { useState, useMemo } from "react";
import { useHarmonicIntervalFn } from "react-use";

import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";
import { calculateTimeLeft } from "~/utils/time";

import { TimeSlot } from "./TimeSlot";

interface IVotingInfoProps {
  pollId: string;
}

export const VotingInfo = ({ pollId }: IVotingInfoProps): JSX.Element => {
  const { isLoading } = useMaci();
  const { getRoundByPollId } = useRound();
  const [timeLeft, setTimeLeft] = useState<[number, number, number, number]>([0, 0, 0, 0]);

  const votingEndsAt = useMemo(() => {
    const round = getRoundByPollId(pollId);
    return round?.votingEndsAt ? new Date(round.votingEndsAt) : new Date();
  }, [getRoundByPollId, pollId]);

  useHarmonicIntervalFn(() => {
    setTimeLeft(calculateTimeLeft(votingEndsAt));
  }, 1000);

  return (
    <div className="flex w-full flex-col">
      <h4 className="font-sans text-base font-normal uppercase text-gray-400">Voting Ends</h4>

      {isLoading && <p className="dark:text-white">Loading...</p>}

      {!isLoading && timeLeft[3] < 0 && <p className="dark:text-white">Voting has ended</p>}

      {!isLoading && timeLeft[3] > 0 && (
        <div className="flex gap-[14px] dark:text-white">
          <TimeSlot num={timeLeft[0]} unit="Days" />

          <TimeSlot num={timeLeft[1]} unit="Hours" />

          <TimeSlot num={timeLeft[2]} unit="Minutes" />

          <TimeSlot num={timeLeft[3]} unit="Seconds" />
        </div>
      )}
    </div>
  );
};
