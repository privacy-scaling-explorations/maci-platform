import clsx from "clsx";
import Link from "next/link";
import { useMemo } from "react";
import { FiCalendar } from "react-icons/fi";

import { Heading } from "~/components/ui/Heading";
import { useRoundState } from "~/utils/state";
import { formatPeriod } from "~/utils/time";
import { ERoundState } from "~/utils/types";

import type { IRoundData } from "~/utils/types";

interface ITimeBarProps {
  start: Date;
  end: Date;
}

interface IRoundTagProps {
  state: ERoundState;
}

interface IRoundItemProps {
  round: IRoundData;
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

const RoundTag = ({ state }: IRoundTagProps): JSX.Element => {
  let tagText: string;

  if (state === ERoundState.APPLICATION) {
    tagText = "Applications Open";
  } else if (state === ERoundState.VOTING) {
    tagText = "Voting Open";
  } else {
    tagText = "Round Closed";
  }

  return (
    <div
      className={clsx(
        "w-max rounded-md border px-1.5 py-1 text-xs uppercase",
        state === ERoundState.APPLICATION || state === ERoundState.VOTING
          ? "border-[#8aca6c] text-[#8aca6c]"
          : "border-[#fc6e31] text-[#fc6e31]",
      )}
    >
      {tagText}
    </div>
  );
};

export const RoundItem = ({ round }: IRoundItemProps): JSX.Element => {
  const roundState = useRoundState({ pollId: round.pollId });

  return (
    <Link href={`/rounds/${round.pollId}`}>
      <div className="m-2 rounded-md border-gray-50 bg-white px-5 py-6 drop-shadow-md">
        <TimeBar end={new Date(round.votingEndsAt)} start={new Date(round.startsAt)} />

        <Heading className="dark:text-black" size="md">
          {round.roundId}
        </Heading>

        <div className="my-4 h-16 overflow-hidden text-gray-400">{round.description}</div>

        <RoundTag state={roundState} />
      </div>
    </Link>
  );
};
