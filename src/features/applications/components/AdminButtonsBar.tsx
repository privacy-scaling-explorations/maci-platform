import { useCallback } from "react";

import { Button } from "~/components/ui/Button";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";

import { useApproveApplication } from "../hooks/useApproveApplication";

interface IAdminButtonsBarProps {
  projectId: string;
}

export const AdminButtonsBar = ({ projectId }: IAdminButtonsBarProps): JSX.Element => {
  const isAdmin = useIsAdmin();
  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();

  const approve = useApproveApplication({});

  const onClick = useCallback(() => {
    approve.mutate([projectId]);
  }, [approve, projectId]);

  return (
    <div className="my-3 flex justify-end gap-2">
      <Button
        suppressHydrationWarning
        disabled={!isAdmin || !isCorrectNetwork}
        size="auto"
        variant="primary"
        onClick={onClick}
      >
        {!isCorrectNetwork ? `Connect to ${correctNetwork.name}` : "Approve application"}
      </Button>
    </div>
  );
};
