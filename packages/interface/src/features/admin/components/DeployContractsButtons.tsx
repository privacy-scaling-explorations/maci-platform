import { useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";

import { FormActionButtons } from "~/components/FormActionButtons";
import { creditStrategyTypes, type Deployment } from "~/features/rounds/types";

import { EDeployStep } from "../types";

interface IDeployContractsButtonsProps {
  step: EDeployStep;
  isUploading: boolean;
  isPending: boolean;
  setStep: (step: EDeployStep) => void;
}

export const DeployContractsButtons = ({
  step,
  isUploading,
  isPending,
  setStep,
}: IDeployContractsButtonsProps): JSX.Element => {
  const form = useFormContext<Deployment>();

  const [creditStrategy, creditAmount] = useMemo(() => form.watch(["creditStrategy", "creditAmount"]), [form]);

  const checkStepComplete = useCallback((): boolean => {
    if (step === EDeployStep.CONFIGURE && creditStrategy === creditStrategyTypes.CONSTANT) {
      return creditAmount > 0;
    }

    return true;
  }, [step, creditStrategy, creditAmount]);

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
