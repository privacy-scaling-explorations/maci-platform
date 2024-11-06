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
import { ApplicationSchema, type Application } from "../types";

import { ApplicationButtons, EApplicationStep } from "./ApplicationButtons";
import { ApplicationSteps } from "./ApplicationSteps";
import { ReviewApplicationDetails } from "./ReviewApplicationDetails";

interface IApplicationFormProps {
  pollId: string;
}

export const ApplicationForm = ({ pollId }: IApplicationFormProps): JSX.Element => {
  const clearDraft = useLocalStorage("application-draft")[2];

  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();

  const { address } = useAccount();

  const router = useRouter();

  /**
   * There are 3 steps for creating an application.
   * The first step is to set the project introduction (profile);
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
    onSuccess: (id: bigint) => {
      clearDraft();
      router.push(`/rounds/${pollId}/applications/confirmation?id=${id.toString()}`);
    },
    onError: (err: { message: string }) =>
      toast.error("Application create error", {
        description: err.message,
      }),
    pollId,
  });

  const handleSubmit = useCallback(
    (application: Application) => {
      create.mutate(application);
    },
    [create],
  );

  const { error: createError } = create;

  return (
    <div className="dark:border-lighterBlack rounded-lg border border-gray-200 p-4">
      <ApplicationSteps step={step} />

      <Form
        defaultValues={{
          payoutAddress: address,
        }}
        schema={ApplicationSchema}
        onSubmit={handleSubmit}
      >
        <FormSection
          className={step === EApplicationStep.PROFILE ? "block" : "hidden"}
          description="Please provide information about your project."
          title="Project Profile"
        >
          <FormControl required hint="This is the name of your project" label="Dashboard name" name="name">
            <Input placeholder="Type your dashboard name" />
          </FormControl>

          <FormControl required hint="This is the name of the author" label="Author name" name="author">
            <Input placeholder="Type the author name" />
          </FormControl>

          <FormControl required label="Description" name="bio">
            <Textarea
              placeholder="What does your dashboard show? What does it help others to understand and how?"
              rows={4}
            />
          </FormControl>

          <div className="gap-4 md:flex">
            <FormControl required className="flex-1" label="Website" name="websiteUrl">
              <Input placeholder="https://" />
            </FormControl>

            <FormControl required className="flex-1" label="Payout address" name="payoutAddress">
              <Input placeholder="0x..." />
            </FormControl>
          </div>

          <div className="gap-4 md:flex">
            <FormControl className="flex-1" label="X(Twitter)" name="twitter" required={false}>
              <Input placeholder="Type your twitter username" />
            </FormControl>

            <FormControl className="flex-1" label="Farcaster" name="farcaster" required={false}>
              <Input placeholder="Type your farcaster username" />
            </FormControl>

            <FormControl
              className="flex-1"
              hint="Provide your github of this project"
              label="Github"
              name="github"
              required={false}
            >
              <Input placeholder="Type your github username" />
            </FormControl>
          </div>

          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <FormControl
              required
              hint="The size should be smaller than 2MB."
              label="Project avatar"
              name="profileImageUrl"
            >
              <ImageUpload className="h-48 w-48" />
            </FormControl>

            <FormControl
              required
              className="flex-1"
              hint="The size should be smaller than 2MB."
              label="Project background image"
              name="bannerImageUrl"
            >
              <ImageUpload className="h-48" />
            </FormControl>
          </div>
        </FormSection>

        <FormSection
          className={step === EApplicationStep.ADVANCED ? "block" : "hidden"}
          description="Describe why is it relevant for Ethereum?."
          title="Relevance"
        >
          <FormControl required label="Why is it relevant for Ethereum?" name="impactDescription">
            <Textarea placeholder="Why is it relevant for Ethereum?" rows={4} />
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
          isUploading={create.isPending}
          step={step}
          onBackStep={handleBackStep}
          onNextStep={handleNextStep}
        />
      </Form>
    </div>
  );
};
