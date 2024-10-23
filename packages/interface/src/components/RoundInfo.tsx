import Image from "next/image";

import { Heading } from "~/components/ui/Heading";
import { config } from "~/config";

interface IRoundInfoProps {
  roundId: string;
}

export const RoundInfo = ({ roundId }: IRoundInfoProps): JSX.Element => (
  <div className="w-full border-b border-gray-200 pb-2">
    <h4>Round</h4>

    <div className="flex items-center gap-2">
      {config.roundLogo && <Image alt="round logo" height="30" src={`/${config.roundLogo}`} width="30" />}

      <Heading as="h3" size="3xl">
        {roundId}
      </Heading>
    </div>
  </div>
);
