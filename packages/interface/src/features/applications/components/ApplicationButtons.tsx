import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { FormActionButtons } from "~/components/FormActionButtons";

import type { ImpactMetrix, ContributionLink, FundingSource } from "~/features/projects/types";

import { type Application, EApplicationStep } from "../types";

interface IApplicationButtonsProps {
  step: EApplicationStep;
  isUploading: boolean;
  isPending: boolean;
  setStep: (step: EApplicationStep) => void;
}

export const ApplicationButtons = ({
  step,
  isUploading,
  isPending,
  setStep,
}: IApplicationButtonsProps): JSX.Element => {
  const form = useFormContext<Application>();

  const [
    name,
    bio,
    payoutAddress,
    websiteUrl,
    profileImageUrl,
    bannerImageUrl,
    contributionDescription,
    impactDescription,
    impactCategory,
    contributionLinks,
    fundingSources,
  ] = useMemo(
    () =>
      form.watch([
        "name",
        "bio",
        "payoutAddress",
        "websiteUrl",
        "profileImageUrl",
        "bannerImageUrl",
        "contributionDescription",
        "impactDescription",
        "impactCategory",
        "contributionLinks",
        "fundingSources",
      ]),
    [form],
  );

  const checkLinks = (
    links: Pick<ContributionLink | ImpactMetrix | FundingSource, "description">[] | undefined,
  ): boolean =>
    links === undefined || links.every((link) => link.description !== undefined && link.description.length > 0);

  const checkStepComplete = (): boolean => {
    if (step === EApplicationStep.PROFILE) {
      return (
        bannerImageUrl !== undefined &&
        profileImageUrl !== undefined &&
        bio.length > 0 &&
        name.length > 0 &&
        payoutAddress.length > 0 &&
        websiteUrl.length > 0
      );
    }

    if (step === EApplicationStep.ADVANCED) {
      return (
        impactCategory !== undefined &&
        impactCategory.length > 0 &&
        contributionDescription.length > 0 &&
        impactDescription.length > 0 &&
        checkLinks(contributionLinks) &&
        checkLinks(fundingSources)
      );
    }

    return true;
  };

  const onNextStep = () => {
    if (!checkStepComplete()) {
      throw new Error("Step not completed.");
    }

    if (step === EApplicationStep.PROFILE) {
      setStep(EApplicationStep.ADVANCED);
    } else if (step === EApplicationStep.ADVANCED) {
      setStep(EApplicationStep.REVIEW);
    }
  };

  const onBackStep = () => {
    if (step === EApplicationStep.ADVANCED) {
      setStep(EApplicationStep.PROFILE);
    } else if (step === EApplicationStep.REVIEW) {
      setStep(EApplicationStep.ADVANCED);
    }
  };

  return (
    <FormActionButtons
      hasNextStep={step !== EApplicationStep.REVIEW}
      hasPrevStep={step !== EApplicationStep.PROFILE}
      isPending={isPending}
      isUploading={isUploading}
      onBackStep={onBackStep}
      onNextStep={onNextStep}
    />
  );
};
