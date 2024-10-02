import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { Heading } from "~/components/ui/Heading";
import { formatPeriod } from "~/utils/time";

import type { Round } from "~/features/rounds/types";

import { CheckItem } from "./CheckItem";

export const ReviewDeployRoundDetails = (): JSX.Element => {
  const form = useFormContext<Round>();

  const round = useMemo(() => form.getValues(), [form]);

  return (
    <div>
      <Heading size="2xl">Review and Deploy</Heading>

      <p className="text-gray-400">Please review and deploy your round contract.</p>

      <div className="flex flex-col gap-2">
        <CheckItem
          text="You are deploying to"
          value={
            <div className="flex items-center gap-1">
              <div
                className="h-8 w-8 rounded-full bg-gray-200 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url("${round.roundLogo}")`,
                }}
              />

              <b className="font-extrabold">{round.roundId}</b>
            </div>
          }
        />

        <CheckItem text="Your round description is" value={round.description} />

        <CheckItem
          text="The Application Phase during is"
          value={formatPeriod({ start: new Date(round.startsAt), end: new Date(round.registrationEndsAt) })}
        />

        <CheckItem
          text="The Voting Phase during is"
          value={formatPeriod({ start: new Date(round.votingStartsAt), end: new Date(round.votingEndsAt) })}
        />

        <CheckItem text="Your round voting strategy is" value={round.votingStrategy} />
      </div>
    </div>
  );
};
