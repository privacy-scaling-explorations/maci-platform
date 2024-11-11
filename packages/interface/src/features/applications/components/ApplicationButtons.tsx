import { useMemo, useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Button, IconButton } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { Spinner } from "~/components/ui/Spinner";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";
import { useSmartAccount } from "~/utils/accountAbstraction";

import type { Application } from "../types";

export enum EApplicationStep {
  PROFILE,
  ADVANCED,
  REVIEW,
}

interface IApplicationButtonsProps {
  step: EApplicationStep;
  isUploading: boolean;
  isPending: boolean;
  onNextStep: () => void;
  onBackStep: () => void;
}

export const ApplicationButtons = ({
  step,
  isUploading,
  isPending,
  onNextStep,
  onBackStep,
}: IApplicationButtonsProps): JSX.Element => {
  const { isCorrectNetwork } = useIsCorrectNetwork();

  const { address } = useSmartAccount();

  const [showDialog, setShowDialog] = useState<boolean>(false);

  const form = useFormContext<Application>();

  const [name, author, bio, payoutAddress, websiteUrl, profileImageUrl, bannerImageUrl, impactDescription] = useMemo(
    () =>
      form.watch([
        "name",
        "author",
        "bio",
        "payoutAddress",
        "websiteUrl",
        "profileImageUrl",
        "bannerImageUrl",
        "impactDescription",
      ]),
    [form],
  );

  const checkStepComplete = (): boolean => {
    if (step === EApplicationStep.PROFILE) {
      return (
        bannerImageUrl !== undefined &&
        profileImageUrl !== undefined &&
        bio.length > 0 &&
        name.length > 0 &&
        author.length > 0 &&
        payoutAddress.length > 0 &&
        websiteUrl.length > 0
      );
    }

    if (step === EApplicationStep.ADVANCED) {
      return impactDescription.length > 0;
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

      {step !== EApplicationStep.PROFILE && (
        <Button className="text-gray-300 underline" size="auto" variant="ghost" onClick={handleOnClickBackStep}>
          Back
        </Button>
      )}

      {step !== EApplicationStep.REVIEW && (
        <Button size="auto" variant="primary" onClick={handleOnClickNextStep}>
          Next
        </Button>
      )}

      {step === EApplicationStep.REVIEW && (
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
