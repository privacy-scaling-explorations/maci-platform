import { useMemo, useCallback, useEffect } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { zeroAddress } from "viem";

import { StatusBar } from "~/components/StatusBar";
import { Button } from "~/components/ui/Button";
import { Spinner } from "~/components/ui/Spinner";
import { useMaci } from "~/contexts/Maci";
import { useProjectById } from "~/features/projects/hooks/useProjects";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";
import { IRecipient } from "~/utils/types";

import { useApplicationByProjectId } from "../hooks/useApplications";
import { useApproveApplication } from "../hooks/useApproveApplication";

interface IReviewBarProps {
  projectId: string;
}

export const ReviewBar = ({ projectId }: IReviewBarProps): JSX.Element => {
  const isAdmin = useIsAdmin();
  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();
  const { pollData } = useMaci();

  const project = useProjectById(projectId, pollData?.registry ?? zeroAddress);
  const application = useApplicationByProjectId(projectId, pollData?.registry ?? zeroAddress);
  const approve = useApproveApplication();

  // determine whether the project is approved or not
  const isApproved = useMemo(() => {
    if (project.data && (project.data as unknown as IRecipient).initialized) {
      return true;
    }

    return false;
  }, [project.data, approve.isSuccess, approve.isError]);

  // approve the application
  const onClick = useCallback(() => {
    if (!application.data) {
      return;
    }
    approve.mutate([application.data.index]);
  }, [approve, application.data]);

  // refetch the application and project data when the approve mutation is successful or pending
  useEffect(() => {
    application.refetch().catch();
    project.refetch().catch();
  }, [approve.isSuccess, approve.isPending]);

  return (
    <div className="mb-4 w-full">
      {isApproved && <StatusBar content="The project has been approved." status="approved" />}

      {!isApproved && isAdmin && <StatusBar content="This project is pending approval." status="pending" />}

      {!isApproved && !isAdmin && (
        <StatusBar
          content={
            <div className="flex items-center gap-2">
              <FiAlertCircle className="h-4 w-4" />

              <span>This project is under review by our team.</span>

              <i>Applications can be edited and approved until the Application period ends.</i>
            </div>
          }
          status="default"
        />
      )}

      {isAdmin && !isApproved && (
        <div className="my-3 flex justify-end gap-2">
          <Button suppressHydrationWarning disabled={!isCorrectNetwork} size="auto" variant="primary" onClick={onClick}>
            {approve.isPending && <Spinner className="mr-2 h-4 w-4" />}

            {!approve.isPending && !isCorrectNetwork ? `Connect to ${correctNetwork.name}` : "Approve application"}
          </Button>
        </div>
      )}
    </div>
  );
};
