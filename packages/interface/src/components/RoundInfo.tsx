import clsx from "clsx";

import { Heading } from "~/components/ui/Heading";

interface IRoundInfoProps {
  roundId: string;
  roundLogo?: string;
}

export const RoundInfo = ({ roundId, roundLogo = undefined }: IRoundInfoProps): JSX.Element => (
  <div className="w-full border-b border-gray-200 pb-2">
    <h4>Round</h4>

    <div className="flex items-center gap-4">
      {roundLogo && <img alt="round logo" height="40" src={roundLogo} width="40" />}

      <Heading size={clsx(roundId.length < 10 ? "3xl" : "2xl")}>{roundId}</Heading>
    </div>
  </div>
);
