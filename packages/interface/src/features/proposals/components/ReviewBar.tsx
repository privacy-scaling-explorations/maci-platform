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

import { useRequestByProjectId } from "../../../hooks/useRequests";
import { useApproveRequest } from "../hooks/useApproveRequest";

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
  const proposal = useRequestByProjectId(projectId, round?.registryAddress ?? zeroAddress);
  const approve = useApproveRequest({});

  const isApproved = useMemo(() => {
    if (project.data && (project.data as unknown as IRecipient).initialized) {
      return true;
    }
    return false;
  }, [project.data, approve.isSuccess, approve.isError]);

  // approve the proposal
  const onClick = useCallback(() => {
    if (!proposal.data) {
      return;
    }
    approve.mutate([proposal.data.index]);
  }, [approve, proposal.data]);

  useEffect(() => {
    proposal.refetch().catch();
    project.refetch().catch();
  }, [approve.isSuccess, approve.isPending]);

  return (
    <div className="mb-4 w-full">
      {isApproved && <StatusBar content="The project proposal has been approved." status="approved" />}

      {!isApproved && isAdmin && <StatusBar content="This project proposal is pending approval." status="pending" />}

      {!isApproved && !isAdmin && (
        <StatusBar
          content={
            <div className="flex items-center gap-2">
              <FiAlertCircle className="h-4 w-4" />

              <span>This project proposal is under review by our team.</span>

              <i>Project proposal can be approved until the Voting period begins.</i>
            </div>
          }
          status="default"
        />
      )}

      {isAdmin && !isApproved && (
        <div className="my-3 flex justify-end gap-2">
          <Button suppressHydrationWarning disabled={!isCorrectNetwork} size="auto" variant="primary" onClick={onClick}>
            {approve.isPending && <Spinner className="mr-2 h-4 w-4" />}

            {!approve.isPending && !isCorrectNetwork ? `Connect to ${correctNetwork.name}` : "Approve proposal"}
          </Button>
        </div>
      )}
    </div>
  );
};
