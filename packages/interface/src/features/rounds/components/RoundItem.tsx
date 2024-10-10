import clsx from "clsx";
import Link from "next/link";
import { useMemo } from "react";
import { FiCalendar } from "react-icons/fi";

import { Heading } from "~/components/ui/Heading";
import { useRoundState } from "~/utils/state";
import { formatPeriod } from "~/utils/time";
import { ERoundState } from "~/utils/types";

import type { Round } from "~/features/rounds/types";

interface ITimeBarProps {
  start: Date;
  end: Date;
}

interface IRoundTagProps {
  isOpen: boolean;
}

interface IRoundItemProps {
  round: Round;
}

const TimeBar = ({ start, end }: ITimeBarProps): JSX.Element => {
  const periodString = useMemo(() => formatPeriod({ start, end }), [start, end]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <FiCalendar />

      <p>{periodString}</p>
    </div>
  );
};

const RoundTag = ({ isOpen }: IRoundTagProps): JSX.Element => (
  <div
    className={clsx(
      "w-max rounded-md border px-1.5 py-1 text-xs uppercase",
      isOpen ? "border-[#8aca6c] text-[#8aca6c]" : "border-[#fc6e31] text-[#fc6e31]",
    )}
  >
    {isOpen ? "Voting Open" : "Round Closed"}
  </div>
);

export const RoundItem = ({ round }: IRoundItemProps): JSX.Element => {
  const roundState = useRoundState(round.roundId);

  return (
    <Link href={`/rounds/${round.roundId}`}>
      <div className="rounded-md border-gray-50 bg-white px-5 py-6 drop-shadow-md">
        <TimeBar end={new Date(round.votingEndsAt)} start={new Date(round.startsAt)} />

        <Heading size="md">{round.roundId}</Heading>

        <p className="my-4 text-gray-400">{round.description}</p>

        <RoundTag isOpen={roundState === ERoundState.APPLICATION || roundState === ERoundState.VOTING} />
      </div>
    </Link>
  );
};
