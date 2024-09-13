import { Transaction } from "@ethereum-attestation-service/eas-sdk";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { useLocalStorage } from "react-use";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import { ImageUpload } from "~/components/ImageUpload";
import { Form, FormControl, FormSection } from "~/components/ui/Form";
import { Input } from "~/components/ui/Input";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";

import { useCreateApplication } from "../hooks/useCreateApplication";
import { ApplicationSchema } from "../types";

import { ApplicationButtons, EApplicationStep } from "./ApplicationButtons";
import { ApplicationSteps } from "./ApplicationSteps";
import { ReviewApplicationDetails } from "./ReviewApplicationDetails";

export const ApplicationForm = (): JSX.Element => {
  const clearDraft = useLocalStorage("application-draft")[2];

  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();

  const { address } = useAccount();

  const router = useRouter();

  /**
   * There are 2 steps for creating an application.
   * The first step is to set the meme introduction (profile);
   * the second step is to set the contributions, impacts, and funding sources (advanced);
   * the last step is to review the input values, allow editing by going back to previous steps (review).
   */
  const [step, setStep] = useState<EApplicationStep>(EApplicationStep.PROFILE);

  const handleNextStep = useCallback(() => {
    if (step === EApplicationStep.PROFILE) {
      setStep(EApplicationStep.REVIEW);
    }
  }, [step, setStep]);

  const handleBackStep = useCallback(() => {
    if (step === EApplicationStep.REVIEW) {
      setStep(EApplicationStep.PROFILE);
    }
  }, [step, setStep]);

  const create = useCreateApplication({
    onSuccess: (data: Transaction<string[]>) => {
      clearDraft();
      router.push(`/applications/confirmation?txHash=${data.tx.hash}`);
    },
    onError: (err: { reason?: string; data?: { message: string } }) =>
      toast.error("Application create error", {
        description: err.reason ?? err.data?.message,
      }),
  });

  const { error: createError } = create;

  return (
    <div className="dark:border-lighterBlack rounded-lg border border-gray-200 p-4">
      <ApplicationSteps step={step} />

      <Form
        schema={ApplicationSchema}
        onSubmit={(application) => {
          create.mutate(application);
        }}
      >
        <FormSection
          className={step === EApplicationStep.PROFILE ? "block" : "hidden"}
          description="Please provide information about your meme."
          title="Meme Profile"
        >
          <FormControl required hint="This is the name of your meme" label="Meme name" name="name">
            <Input placeholder="Type your meme name" />
          </FormControl>

          <div className="mb-4 gap-4 md:flex">
            <FormControl
              required
              hint="The size should be smaller than 1MB."
              label="Meme Picture"
              name="profileImageUrl"
            >
              <ImageUpload className="h-48 w-48 " />
            </FormControl>
          </div>
        </FormSection>

        {step === EApplicationStep.REVIEW && <ReviewApplicationDetails />}

        {step === EApplicationStep.REVIEW && (
          <div className="mb-2 w-full text-right text-sm italic text-blue-400">
            {!address && <p>You must connect wallet to create an application</p>}

            {!isCorrectNetwork && <p className="gap-2">You must be connected to {correctNetwork.name}</p>}

            {createError && (
              <p>
                Make sure you&apos;re not connected to a VPN since this can cause problems with the RPC and your wallet.
              </p>
            )}
          </div>
        )}

        <ApplicationButtons
          isPending={create.isPending}
          isUploading={create.isUploading}
          step={step}
          onBackStep={handleBackStep}
          onNextStep={handleNextStep}
        />
      </Form>
    </div>
  );
};
