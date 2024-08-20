import { useRouter } from "next/router";
import { useState } from "react";
import { useAccount } from "wagmi";

import { Steps } from "~/components/Steps";
import { Form, FormSection } from "~/components/ui/Form";
import { Heading } from "~/components/ui/Heading";
import { RadioSelect } from "~/components/ui/RadioSelect";
import { useRound } from "~/contexts/Round";
import { DeploymentSchema, chainTypes, gatingStrategyTypes } from "~/features/rounds/types";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";

import { EDeployStep } from "../types";

import { DeployContractsButtons } from "./DeployContractsButtons";
import { ReviewDeployContractsDetails } from "./ReviewDeployContractsDetails";
import { VoiceCreditProxySelect } from "./VoiceCreditProxySelect";

export const DeployContracts = (): JSX.Element => {
  const router = useRouter();
  const [step, setStep] = useState<EDeployStep>(EDeployStep.CONFIGURE);

  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();

  const { address } = useAccount();

  const { deployContracts } = useRound();

  const onSubmit = () => {
    deployContracts();
    router.push("/");
  };

  return (
    <div>
      <Heading size="4xl">Deploy Core Contracts</Heading>

      <p className="text-gray-400">These initial MACI core contracts configuration will apply to all future rounds.</p>

      <div className="dark:border-lighterBlack rounded-lg border border-gray-200 p-4">
        <Steps step={step} stepNames={["Configure Contracts", "Review & Deploy"]} />

        <Form schema={DeploymentSchema} onSubmit={onSubmit}>
          <FormSection
            className={step === EDeployStep.CONFIGURE ? "block" : "hidden"}
            description="Please select from the available options:"
            title="Configure Contracts"
          >
            <RadioSelect
              required
              hint="Choose a chain to deploy your contracts"
              label="Chain to deploy"
              name="chain"
              options={Object.values(chainTypes)}
            />

            <RadioSelect
              required
              hint="Choose a gating strategy"
              label="Gating Strategy"
              name="gatingStrategy"
              options={Object.values(gatingStrategyTypes)}
            />

            <VoiceCreditProxySelect />
          </FormSection>

          {step === EDeployStep.REVIEW && <ReviewDeployContractsDetails />}

          {step === EDeployStep.REVIEW && (
            <div className="mb-2 w-full text-right text-sm italic text-blue-400">
              {!address && <p>You must connect wallet to create an application</p>}

              {!isCorrectNetwork && <p className="gap-2">You must be connected to {correctNetwork.name}</p>}
            </div>
          )}

          <DeployContractsButtons isPending={false} isUploading={false} setStep={setStep} step={step} />
        </Form>
      </div>
    </div>
  );
};
