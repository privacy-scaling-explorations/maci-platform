import dynamic from "next/dynamic";
import { type PropsWithChildren } from "react";

import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { useApproveApplication } from "~/features/applications/hooks/useApproveApplication";
import { useIsAdmin } from "~/hooks/useIsAdmin";

import { useApprovedApplications } from "../hooks/useApprovedApplications";

const ApproveButton = ({
  children = "Approve project",
  projectIds = [],
}: PropsWithChildren<{ projectIds: string[] }>) => {
  const isAdmin = useIsAdmin();
  const approvals = useApprovedApplications(projectIds);

  const approve = useApproveApplication();
  if (approvals.data?.length) {
    return (
      <Badge size="lg" variant="success">
        Approved
      </Badge>
    );
  }
  return (
    isAdmin && (
      <Button
        disabled={approve.isPending}
        variant="primary"
        onClick={() => {
          approve.mutate(projectIds);
        }}
      >
        {children}
      </Button>
    )
  );
};

export default dynamic(() => Promise.resolve(ApproveButton));
