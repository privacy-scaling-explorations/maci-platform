import Image from "next/image";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { Heading } from "~/components/ui/Heading";
import { creditStrategyTypes, type Deployment } from "~/features/rounds/types";

import { CheckItem } from "./CheckItem";

export const ReviewDeployContractsDetails = (): JSX.Element => {
  const form = useFormContext<Deployment>();

  const deployment = useMemo(() => form.getValues(), [form]);

  return (
    <div>
      <Heading size="2xl">Review and Deploy</Heading>

      <p className="text-gray-400">Please review and deploy your host contracts.</p>

      <div className="flex flex-col gap-2">
        <CheckItem
          text="You are deploying to"
          value={
            <div className="flex items-center gap-1">
              <Image
                alt={deployment.chain}
                className="dark:invert"
                height="16"
                src={`/${deployment.chain}.svg`}
                width="16"
              />

              <b>{deployment.chain}</b>
            </div>
          }
        />

        <CheckItem
          text="You're using"
          value={
            <div className="flex items-center gap-1">
              <Image
                alt={deployment.gatingStrategy}
                className="dark:invert"
                height="16"
                src={`/${deployment.gatingStrategy}.svg`}
                width="16"
              />

              <b>{deployment.gatingStrategy}</b>

              <p>to gate access to all upcoming rounds.</p>
            </div>
          }
        />

        <CheckItem
          text="You're using a"
          value={
            <div className="flex items-center gap-1">
              <Image
                alt={deployment.creditStrategy}
                className="dark:invert"
                height="16"
                src={`/${deployment.creditStrategy}.svg`}
                width="16"
              />

              <b>{`${deployment.creditStrategy} ${deployment.creditStrategy === creditStrategyTypes.CONSTANT ? deployment.creditAmount : ""} voice credits`}</b>

              <p>allocation for all upcoming rounds.</p>
            </div>
          }
        />
      </div>
    </div>
  );
};
