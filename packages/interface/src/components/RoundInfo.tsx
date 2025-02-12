import Image from "next/image";
import { useState } from "react";

import { Heading } from "~/components/ui/Heading";
import { config } from "~/config";

interface IRoundInfoProps {
  roundId: string;
}

export const RoundInfo = ({ roundId }: IRoundInfoProps): JSX.Element => {
  const [isLogoValid, setIsLogoValid] = useState(true);

  return (
    <div className="w-full border-b border-gray-200 pb-2">
      <span className="font-sans text-base font-normal uppercase text-gray-400">Round</span>

      <div className="flex items-center gap-2">
        {config.roundLogo && isLogoValid && (
          <Image
            alt="round logo"
            height="30"
            src={`/${config.roundLogo}`}
            width="30"
            onError={() => {
              setIsLogoValid(false);
            }}
          />
        )}

        <Heading as="h3" size="3xl">
          {roundId}
        </Heading>
      </div>
    </div>
  );
};
