import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import { ImageUpload } from "~/components/ImageUpload";
import { FieldArray, Form, FormControl, FormSection, Textarea } from "~/components/ui/Form";
import { Input } from "~/components/ui/Input";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";
import { cn } from "~/utils/classNames";

import { useCreateProposal } from "../hooks/useCreateProposal";
import { MetadataSchema, contributionTypes, fundingSourceTypes, type Metadata } from "../types";

import { ImpactTags } from "./ImpactTags";
import { MetadataButtons, EMetadataStep } from "./MetadataButtons";
import { MetadataSteps } from "./MetadataSteps";
import { ReviewProposalDetails } from "./ReviewProposalDetails";

interface IMetadataFormProps {
  pollId: string;
}

export const MetadataForm = ({ pollId }: IMetadataFormProps): JSX.Element => {
  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();

  const { address } = useAccount();

  const router = useRouter();

  /**
   * There are 3 steps for creating a project proposal.
   * The first step is to set the project introduction (profile);
   * the second step is to set the contributions, impacts, and funding sources (advanced);
   * the last step is to review the input values, allow editing by going back to previous steps (review).
   */
  const [step, setStep] = useState<EMetadataStep>(EMetadataStep.PROFILE);

  const handleNextStep = useCallback(() => {
    if (step === EMetadataStep.PROFILE) {
      setStep(EMetadataStep.ADVANCED);
    } else if (step === EMetadataStep.ADVANCED) {
      setStep(EMetadataStep.REVIEW);
    }
  }, [step, setStep]);

  const handleBackStep = useCallback(() => {
    if (step === EMetadataStep.REVIEW) {
      setStep(EMetadataStep.ADVANCED);
    } else if (step === EMetadataStep.ADVANCED) {
      setStep(EMetadataStep.PROFILE);
    }
  }, [step, setStep]);

  const create = useCreateProposal({
    onSuccess: (id: bigint) => {
      router.push(`/rounds/${pollId}/proposals/confirmation?index=${id.toString()}`);
    },
    onError: (err: { message: string }) =>
      toast.error("Proposal create error", {
        description: err.message,
      }),
    pollId,
  });

  const handleSubmit = useCallback(
    (metadata: Metadata) => {
      create.mutate(metadata);
    },
    [create],
  );

  const { error: createError } = create;

  return (
    <div className="dark:border-lighterBlack flex w-full flex-col gap-10 rounded-lg border border-gray-200 p-5 sm:w-[824px]">
      <MetadataSteps step={step} />

      <Form
        defaultValues={{
          payoutAddress: address,
        }}
        schema={MetadataSchema}
        onSubmit={handleSubmit}
      >
        <FormSection
          className={step === EMetadataStep.PROFILE ? "flex flex-col" : "hidden"}
          description="Please provide information about your project."
          title="Project Profile"
        >
          <FormControl required hint="This is the name of your project" label="Project name" name="name">
            <Input placeholder="Type your project name" />
          </FormControl>

          <FormControl required label="Short Description" name="shortBio">
            <Textarea placeholder="Short description. Maximum 140 characters." rows={4} />
          </FormControl>

          <FormControl required description="*Markdown Supported" label="Description" name="bio">
            <Textarea placeholder="Type project description" rows={4} />
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

            <FormControl className="flex-1" label="Github" name="github" required={false}>
              <Input placeholder="Type your github username" />
            </FormControl>
          </div>

          <FormControl required hint="Maximum size 1MB" label="Project avatar" name="profileImageUrl">
            <ImageUpload rounded className="h-48 w-48" />
          </FormControl>

          <FormControl
            required
            className="flex-1"
            hint="Maximum size 1MB"
            label="Project background image"
            name="bannerImageUrl"
          >
            <ImageUpload className="h-48" />
          </FormControl>
        </FormSection>

        <FormSection
          className={step === EMetadataStep.ADVANCED ? "flex flex-col" : "hidden"}
          description="Describe the contribution and impact of your project."
          title="Contribution & Impact"
        >
          <FormControl
            required
            description="*Markdown Supported"
            label="Contribution description"
            name="contributionDescription"
          >
            <Textarea placeholder="What have your project contributed to?" rows={4} />
          </FormControl>

          <FormControl required description="*Markdown Supported" label="Impact description" name="impactDescription">
            <Textarea placeholder="What impact has your project had?" rows={4} />
          </FormControl>

          <ImpactTags />

          <FieldArray
            description="Where can we find your contributions?"
            name="contributionLinks"
            renderField={(field, i) => (
              <div className={cn("flex flex-wrap gap-[12px]", i > 0 && "border-t border-gray-100 pt-3")}>
                <FormControl required className="w-full" name={`contributionLinks.${i}.description`}>
                  <Input placeholder="Type the description of your contribution" />
                </FormControl>

                <FormControl required className="w-full" name={`contributionLinks.${i}.type`}>
                  <Controller
                    defaultValue="" // or set a default if needed
                    name={`contributionLinks.${i}.type`}
                    render={({ field: fieldCheckbox }) => (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(contributionTypes).map(([optionValue, label]) => (
                          <label key={optionValue} className="flex items-center gap-2">
                            <input
                              checked={fieldCheckbox.value === optionValue}
                              name={fieldCheckbox.name} // ensures the same radio group
                              type="radio"
                              value={optionValue}
                              onChange={(e) => {
                                fieldCheckbox.onChange(e.target.value);
                              }}
                            />

                            {label}
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </FormControl>

                <FormControl required className="min-w-72" name={`contributionLinks.${i}.url`}>
                  <Input placeholder="https://" />
                </FormControl>
              </div>
            )}
            title="Contribution links"
          />

          <FieldArray
            description="From what sources have you received funding?"
            name="fundingSources"
            renderField={(_field, i) => (
              <div className="flex flex-wrap gap-2">
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-4">
                  <FormControl required className="col-span-1 lg:col-span-2" name={`fundingSources.${i}.description`}>
                    <Input placeholder="Type the name of your funding source" />
                  </FormControl>

                  <FormControl required valueAsNumber className="col-span-1" name={`fundingSources.${i}.amount`}>
                    <Input placeholder="Amount" type="number" />
                  </FormControl>

                  <FormControl required className="col-span-1" name={`fundingSources.${i}.currency`}>
                    <Input placeholder="e.g. USD" />
                  </FormControl>
                </div>

                <FormControl required name={`fundingSources.${i}.type`}>
                  <Controller
                    defaultValue="" // or set a default if needed
                    name={`fundingSources.${i}.type`}
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(fundingSourceTypes).map(([optionValue, label]) => (
                          <label key={optionValue} className="flex items-center gap-2">
                            <input
                              checked={field.value === optionValue}
                              name={field.name} // ensures the same radio group
                              type="radio"
                              value={optionValue}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />

                            {label}
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </FormControl>
              </div>
            )}
            title="Funding sources"
          />
        </FormSection>

        {step === EMetadataStep.REVIEW && <ReviewProposalDetails />}

        {step === EMetadataStep.REVIEW && (
          <div className="mb-2 w-full text-right text-sm italic text-blue-400">
            {!address && <p>You must connect wallet to create a proposal of a project</p>}

            {!isCorrectNetwork && <p className="gap-2">You must be connected to {correctNetwork.name}</p>}

            {createError && (
              <p>
                Make sure you&apos;re not connected to a VPN since this can cause problems with the RPC and your wallet.
              </p>
            )}
          </div>
        )}

        <div className="mt-10">
          <MetadataButtons
            isPending={create.isPending}
            isUploading={create.isPending}
            step={step}
            onBackStep={handleBackStep}
            onNextStep={handleNextStep}
          />
        </div>
      </Form>
    </div>
  );
};
