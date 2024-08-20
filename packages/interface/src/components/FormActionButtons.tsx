import { useState, useCallback } from "react";
import { useAccount } from "wagmi";

import { Button, IconButton } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { Spinner } from "~/components/ui/Spinner";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";

interface IFormActionButtonsProps {
  hasNextStep: boolean;
  hasPrevStep: boolean;
  isUploading: boolean;
  isPending: boolean;
  onNextStep: () => void;
  onBackStep: () => void;
}

export const FormActionButtons = ({
  hasNextStep,
  hasPrevStep,
  isUploading,
  isPending,
  onNextStep,
  onBackStep,
}: IFormActionButtonsProps): JSX.Element => {
  const { isCorrectNetwork } = useIsCorrectNetwork();

  const { address } = useAccount();

  const [showDialog, setShowDialog] = useState<boolean>(false);

  const handleOnClickNextStep = useCallback(
    (event: UIEvent) => {
      event.preventDefault();

      try {
        onNextStep();
      } catch (e) {
        setShowDialog(true);
      }
    },
    [onNextStep, setShowDialog],
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

      {hasPrevStep && (
        <Button className="text-gray-300 underline" size="auto" variant="ghost" onClick={handleOnClickBackStep}>
          Back
        </Button>
      )}

      {hasNextStep && (
        <Button size="auto" variant="primary" onClick={handleOnClickNextStep}>
          Next
        </Button>
      )}

      {!hasNextStep && (
        <IconButton
          disabled={isPending || !address || !isCorrectNetwork}
          icon={isPending ? Spinner : null}
          isLoading={isPending}
          size="auto"
          type="submit"
          variant="primary"
        >
          {isUploading ? "Uploading..." : "Submit"}
        </IconButton>
      )}
    </div>
  );
};
