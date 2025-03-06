import Link from "next/link";
import { useMemo, useCallback, useEffect } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { Button } from "~/components/ui/Button";
import { Spinner } from "~/components/ui/Spinner";
import { StatusBar } from "~/components/ui/StatusBar";
import { useRound } from "~/contexts/Round";
import { useApprovedProjectByRecipientIndex } from "~/features/projects/hooks/useProjects";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";
import { IRequest, IRecipient } from "~/utils/types";

import { useRequestByProjectId } from "../../../hooks/useRequests";
import { useApproveRequest } from "../hooks/useApproveRequest";

interface IReviewBarProps {
  pollId: string;
  projectId: string;
  edition?: string;
}

export const ReviewBar = ({ pollId, projectId, edition = undefined }: IReviewBarProps): JSX.Element => {
  const { getRoundByPollId } = useRound();

  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);

  const isAdmin = useIsAdmin();
  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();

  const proposal = useRequestByProjectId(projectId, round?.registryAddress ?? zeroAddress);
  const approve = useApproveRequest({});

  const { address } = useAccount();

  const isApproved = useMemo(() => {
    if (proposal.data && (proposal.data as unknown as IRequest).status.toString() === "Approved") {
      return true;
    }
    return false;
  }, [proposal.data, approve.isSuccess, approve.isError]);

  const isOwner = useMemo(() => {
    if (proposal.data && (proposal.data.recipient as IRecipient).payout === address?.toLowerCase()) {
      return true;
    }

    return false;
  }, [proposal, address]);

  const original = useApprovedProjectByRecipientIndex(
    round?.registryAddress ?? zeroAddress,
    proposal.data?.recipientIndex ?? "",
  );

  const originalProposal = useMemo(() => {
    if (!isApproved && original.data) {
      return original.data.find((r) => r.initialized === true);
    }

    return undefined;
  }, [proposal, original, isApproved]);

  // approve the proposal
  const onClick = useCallback(() => {
    if (!proposal.data) {
      return;
    }
    approve.mutate([proposal.data.index]);
  }, [approve, proposal.data]);

  useEffect(() => {
    proposal.refetch().catch();
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

      <div className="my-3 flex justify-end gap-2">
        {(isOwner || isAdmin) && originalProposal && (
          <Button as={Link} href={`/rounds/${pollId}/${originalProposal.id}`} size="auto" variant="tertiary">
            Check original version.
          </Button>
        )}

        {(isOwner || isAdmin) && edition && (
          <Button as={Link} href={`/rounds/${pollId}/${edition}`} size="auto" variant="tertiary">
            There is a pending edition of this proposal, click to check.
          </Button>
        )}

        {isAdmin && !isApproved && (
          <Button suppressHydrationWarning disabled={!isCorrectNetwork} size="auto" variant="primary" onClick={onClick}>
            {approve.isPending && <Spinner className="mr-2 h-4 w-4" />}

            {!approve.isPending && !isCorrectNetwork ? `Connect to ${correctNetwork.name}` : "Approve proposal"}
          </Button>
        )}

        {isOwner && isApproved && !edition && (
          <Button as={Link} href={`/rounds/${pollId}/proposals/edit?id=${projectId}`} size="auto" variant="primary">
            Edit Proposal
          </Button>
        )}
      </div>
    </div>
  );
};
