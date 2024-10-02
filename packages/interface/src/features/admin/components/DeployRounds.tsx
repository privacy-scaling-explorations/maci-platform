import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import { ImageUpload } from "~/components/ImageUpload";
import { Steps } from "~/components/Steps";
import { Form, FormSection, FormControl, Textarea, Select, DateInput } from "~/components/ui/Form";
import { Heading } from "~/components/ui/Heading";
import { Input } from "~/components/ui/Input";
import { RoundSchema, votingStrategyTypes } from "~/features/rounds/types";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";

import { useDeployRound } from "../hooks/useDeployRound";
import { EDeployStep } from "../types";

import { DeployRoundsButtons } from "./DeployRoundsButtons";
import { ReviewDeployRoundDetails } from "./ReviewDeployRoundDetails";

export const DeployRounds = (): JSX.Element => {
  const router = useRouter();

  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();

  const { address } = useAccount();

  const [step, setStep] = useState<EDeployStep>(EDeployStep.CONFIGURE);

  const create = useDeployRound({
    onSuccess: () => {
      router.push(`/`);
    },
    onError: (err: Error) =>
      toast.error("Round deploy error", {
        description: err.message,
      }),
  });

  const { error: createError } = create;

  return (
    <div>
      <Heading size="4xl">Deploy Round Contracts</Heading>

      <p className="text-gray-400">These round contracts specify the features for this round.</p>

      <div className="dark:border-lighterBlack rounded-lg border border-gray-200 p-4">
        <Steps step={step} stepNames={["Configure Contracts", "Review & Deploy"]} />

        <Form
          defaultValues={{ roundId: "", description: "" }}
          schema={RoundSchema}
          onSubmit={(round) => {
            create.mutate(round);
          }}
        >
          <FormSection
            className={step === EDeployStep.CONFIGURE ? "block" : "hidden"}
            description="Please select from the available options to configure the deployment of this round."
            title="Configure Contracts"
          >
            <FormControl required hint="This is the name of your round" label="Round Name" name="roundId">
              <Input placeholder="Type the name of your round" />
            </FormControl>

            <div className="w-full gap-4 md:flex">
              <FormControl required className="w-full" label="Round Description" name="description">
                <Textarea
                  className="h-48"
                  placeholder="Briefly describe your round in a sentence or two (200 characters max)"
                />
              </FormControl>

              <FormControl required hint="png or jpg file size 500x500 px" label="Round Logo" name="roundLogo">
                <ImageUpload className="h-48 w-48" />
              </FormControl>
            </div>

            <div className="gap-4 md:flex">
              <FormControl required label="Round Starts At" name="startsAt">
                <DateInput />
              </FormControl>

              <FormControl required label="Registration Ends At" name="registrationEndsAt">
                <DateInput />
              </FormControl>

              <FormControl required label="Poll Starts At" name="votingStartsAt">
                <DateInput />
              </FormControl>

              <FormControl required label="Poll Ends At" name="votingEndsAt">
                <DateInput />
              </FormControl>
            </div>

            <FormControl required hint="Choose a voting strategy" label="Voting Strategy" name="votingStrategy">
              <Select>
                {Object.entries(votingStrategyTypes).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </FormSection>

          {step === EDeployStep.REVIEW && <ReviewDeployRoundDetails />}

          {step === EDeployStep.REVIEW && (
            <div className="mb-2 w-full text-right text-sm italic text-blue-400">
              {!address && <p>You must connect wallet to create an application</p>}

              {!isCorrectNetwork && <p className="gap-2">You must be connected to {correctNetwork.name}</p>}

              {createError && (
                <p>
                  Make sure you&apos;re not connected to a VPN since this can cause problems with the RPC and your
                  wallet.
                </p>
              )}
            </div>
          )}

          <DeployRoundsButtons
            isPending={create.isPending}
            isUploading={create.isPending}
            setStep={setStep}
            step={step}
          />
        </Form>
      </div>
    </div>
  );
};
