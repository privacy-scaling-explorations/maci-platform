import { useMemo, useCallback, useEffect } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { zeroAddress } from "viem";

import { StatusBar } from "~/components/StatusBar";
import { Button } from "~/components/ui/Button";
import { Spinner } from "~/components/ui/Spinner";
import { useRound } from "~/contexts/Round";
import { useProjectById } from "~/features/projects/hooks/useProjects";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";
import { IRecipient } from "~/utils/types";

import { useApplicationByProjectId } from "../hooks/useApplications";
import { useApproveApplication } from "../hooks/useApproveApplication";

interface IReviewBarProps {
  pollId: string;
  projectId: string;
}

export const ReviewBar = ({ pollId, projectId }: IReviewBarProps): JSX.Element => {
  const { getRoundByPollId } = useRound();

  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);

  const isAdmin = useIsAdmin();
  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();

  const project = useProjectById(projectId, round?.registryAddress ?? zeroAddress);
  const application = useApplicationByProjectId(projectId, round?.registryAddress ?? zeroAddress);
  const approve = useApproveApplication({});

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

              <i>Applications can be approved until the Voting period begins.</i>
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
