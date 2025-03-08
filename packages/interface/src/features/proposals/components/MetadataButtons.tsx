import { useMemo, useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useAccount } from "wagmi";

import { Button, IconButton } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { Spinner } from "~/components/ui/Spinner";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";

import type { Metadata } from "../types";
import type { ImpactMetrix, ContributionLink, FundingSource } from "~/features/projects/types";

export enum EMetadataStep {
  PROFILE,
  ADVANCED,
  REVIEW,
}

interface IMetadataButtonsProps {
  step: EMetadataStep;
  isUploading: boolean;
  isPending: boolean;
  onNextStep: () => void;
  onBackStep: () => void;
}

export const MetadataButtons = ({
  step,
  isUploading,
  isPending,
  onNextStep,
  onBackStep,
}: IMetadataButtonsProps): JSX.Element => {
  const { isCorrectNetwork } = useIsCorrectNetwork();

  const { address } = useAccount();

  const [showDialog, setShowDialog] = useState<boolean>(false);

  const form = useFormContext<Metadata>();

  const [
    name,
    shortBio,
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
        "shortBio",
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
    if (step === EMetadataStep.PROFILE) {
      return (
        bannerImageUrl !== undefined &&
        profileImageUrl !== undefined &&
        shortBio.length > 0 &&
        bio.length > 0 &&
        name.length > 0 &&
        payoutAddress.length > 0 &&
        websiteUrl.length > 0
      );
    }

    if (step === EMetadataStep.ADVANCED) {
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

  const handleOnClickNextStep = useCallback(
    (event: UIEvent) => {
      event.preventDefault();

      if (checkStepComplete()) {
        onNextStep();
      } else {
        setShowDialog(true);
      }
    },
    [onNextStep, setShowDialog, checkStepComplete],
  );

  const handleOnClickBackStep = useCallback(
    (event: UIEvent) => {
      event.preventDefault();
      onBackStep();
    },
    [onBackStep],
  );

  const handleOnOpenChange = useCallback(() => {
    setShowDialog(false);
  }, [setShowDialog]);

  return (
    <div className="flex justify-end gap-2">
      <Dialog
        description="There are still some inputs not fulfilled, please complete all the required information."
        isOpen={showDialog}
        size="sm"
        title="Please complete all the required information"
        onOpenChange={handleOnOpenChange}
      />

      {step !== EMetadataStep.PROFILE && (
        <Button
          className="!font-sm !font-normal !normal-case text-gray-300 underline"
          size="md"
          variant="ghost"
          onClick={handleOnClickBackStep}
        >
          Back
        </Button>
      )}

      {step !== EMetadataStep.REVIEW && (
        <Button size="md" variant="primary" onClick={handleOnClickNextStep}>
          Next
        </Button>
      )}

      {step === EMetadataStep.REVIEW && (
        <IconButton
          disabled={isPending || !address || !isCorrectNetwork}
          icon={isPending ? Spinner : null}
          size="auto"
          type="submit"
          variant="primary"
        >
          {isUploading ? "Uploading metadata" : "Submit"}
        </IconButton>
      )}
    </div>
  );
};
