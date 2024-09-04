import { Transaction } from "@ethereum-attestation-service/eas-sdk";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { useLocalStorage } from "react-use";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import { ImageUpload } from "~/components/ImageUpload";
import { Form, FormControl, FormSection, Textarea } from "~/components/ui/Form";
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
   * There are 3 steps for creating an application.
   * The first step is to set the beach introduction (profile);
   * the second step is to set the contributions, impacts, and funding sources (advanced);
   * the last step is to review the input values, allow editing by going back to previous steps (review).
   */
  const [step, setStep] = useState<EApplicationStep>(EApplicationStep.PROFILE);

  const handleNextStep = useCallback(() => {
    if (step === EApplicationStep.PROFILE) {
      setStep(EApplicationStep.ADVANCED);
    } else if (step === EApplicationStep.ADVANCED) {
      setStep(EApplicationStep.REVIEW);
    }
  }, [step, setStep]);

  const handleBackStep = useCallback(() => {
    if (step === EApplicationStep.REVIEW) {
      setStep(EApplicationStep.ADVANCED);
    } else if (step === EApplicationStep.ADVANCED) {
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
          description="Please provide information about your beach."
          title="Beach Profile"
        >
          <FormControl required hint="This is the name of your beach" label="beach name" name="name">
            <Input placeholder="Type your beach name" />
          </FormControl>

          <FormControl required label="Description" name="bio">
            <Textarea placeholder="Type beach description" rows={4} />
          </FormControl>

          <div className="gap-4 md:flex">
            <FormControl className="flex-1" label="Website" name="websiteUrl" required={false}>
              <Input placeholder="https://" />
            </FormControl>

            <FormControl className="flex-1" label="X(Twitter)" name="twitter" required={false}>
              <Input placeholder="Type your twitter username" />
            </FormControl>
          </div>

          <div className="mb-4 gap-4 md:flex">
            <FormControl
              required
              hint="The size should be smaller than 1MB."
              label="beach avatar"
              name="profileImageUrl"
            >
              <ImageUpload className="h-48 w-48 " />
            </FormControl>

            <FormControl
              required
              className="flex-1"
              hint="The size should be smaller than 1MB."
              label="beach background image"
              name="bannerImageUrl"
            >
              <ImageUpload className="h-48 " />
            </FormControl>
          </div>
        </FormSection>

        <FormSection
          className={step === EApplicationStep.ADVANCED ? "block" : "hidden"}
          description="Describe the activities of your beach."
          title="Activities"
        >
          <FormControl required label="Activities description" name="activitiesDescription">
            <Textarea placeholder="What can you do in your beach?" rows={4} />
          </FormControl>
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
