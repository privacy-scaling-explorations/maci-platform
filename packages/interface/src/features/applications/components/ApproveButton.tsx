import { useFormContext } from "react-hook-form";

import { Button } from "~/components/ui/Button";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";

import type { TApplicationsToApprove } from "../types";

interface IApproveButtonProps {
  isLoading?: boolean;
}

export const ApproveButton = ({ isLoading = false }: IApproveButtonProps): JSX.Element => {
  const isAdmin = useIsAdmin();
  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();
  const form = useFormContext<TApplicationsToApprove>();
  const selectedCount = Object.values(form.watch("selected")).filter(Boolean).length;

  const text = isAdmin ? `Approve ${selectedCount} applications` : "You must be an admin";

  return (
    <Button
      suppressHydrationWarning
      className="mt-2 w-full sm:w-auto"
      disabled={!selectedCount || !isAdmin || isLoading || !isCorrectNetwork}
      size="auto"
      type="submit"
      variant="primary"
    >
      {!isCorrectNetwork ? `Connect to ${correctNetwork.name}` : text}
    </Button>
  );
};
