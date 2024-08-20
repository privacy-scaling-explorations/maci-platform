import { useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";

import { FormActionButtons } from "~/components/FormActionButtons";

import type { Round } from "~/features/rounds/types";

import { EDeployStep } from "../types";

interface IDeployRoundsButtonsProps {
  step: EDeployStep;
  isUploading: boolean;
  isPending: boolean;
  setStep: (step: EDeployStep) => void;
}

export const DeployRoundsButtons = ({
  step,
  isUploading,
  isPending,
  setStep,
}: IDeployRoundsButtonsProps): JSX.Element => {
  const form = useFormContext<Round>();

  const [roundId, description, roundLogo, startsAt, registrationEndsAt, votingStartsAt, votingEndsAt] = useMemo(
    () =>
      form.watch([
        "roundId",
        "description",
        "roundLogo",
        "startsAt",
        "registrationEndsAt",
        "votingStartsAt",
        "votingEndsAt",
      ]),
    [form],
  );

  const checkStepComplete = useCallback((): boolean => {
    if (step === EDeployStep.CONFIGURE) {
      return (
        roundId.length > 0 &&
        description.length > 0 &&
        roundLogo !== undefined &&
        startsAt.length > 0 &&
        registrationEndsAt.length > 0 &&
        votingStartsAt.length > 0 &&
        votingEndsAt.length > 0
      );
    }

    return true;
  }, [step, roundId, description, roundLogo, startsAt, registrationEndsAt, votingStartsAt, votingEndsAt]);

  const onNextStep = useCallback(() => {
    if (!checkStepComplete()) {
      throw new Error("Step not completed.");
    }

    if (step === EDeployStep.CONFIGURE) {
      setStep(EDeployStep.REVIEW);
    }
  }, [step, setStep, checkStepComplete]);

  const onBackStep = useCallback(() => {
    if (step === EDeployStep.REVIEW) {
      setStep(EDeployStep.CONFIGURE);
    }
  }, [step, setStep]);

  return (
    <FormActionButtons
      hasNextStep={step === EDeployStep.CONFIGURE}
      hasPrevStep={step === EDeployStep.REVIEW}
      isPending={isPending}
      isUploading={isUploading}
      onBackStep={onBackStep}
      onNextStep={onNextStep}
    />
  );
};
