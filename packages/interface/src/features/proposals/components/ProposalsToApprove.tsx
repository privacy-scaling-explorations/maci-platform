import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useCallback, useMemo } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { zeroAddress } from "viem";

import { EmptyState } from "~/components/EmptyState";
import { Button } from "~/components/ui/Button";
import { Form } from "~/components/ui/Form";
import { Heading } from "~/components/ui/Heading";
import { Spinner } from "~/components/ui/Spinner";
import { useRound } from "~/contexts/Round";
import { useApprovedRequests, usePendingRequests } from "~/hooks/useRequests";

import { RequestsHeader } from "../../requests/components/RequestsHeader";
import { useApproveRequest } from "../hooks/useApproveRequest";
import { RequestSchema, type TRequestToApprove } from "../types";

import { ApproveButton } from "./ApproveButton";
import { ProposalItem } from "./ProposalItem";

interface IProposalsToApproveProps {
  pollId: string;
}

/**
 * Displays the proposals that are pending approval.
 */
export const ProposalsToApprove = ({ pollId }: IProposalsToApproveProps): JSX.Element => {
  const router = useRouter();
  const { getRoundByPollId } = useRound();

  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);
  const approved = useApprovedRequests(round?.registryAddress ?? zeroAddress);
  const pending = usePendingRequests(round?.registryAddress ?? zeroAddress);
  const approve = useApproveRequest({});

  useEffect(() => {
    approved.refetch().catch();
    pending.refetch().catch();
  }, [approve.isSuccess, approve.isPending, approve.isError]);

  const handleSubmit = useCallback(
    (values: TRequestToApprove) => {
      approve.mutate(values.selected);
    },
    [approve],
  );

  return (
    <div className="flex w-full justify-center dark:text-white">
      <div className="flex flex-col gap-4 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg">
        <Heading as="h3" size="3xl">
          Review Project Proposals
        </Heading>

        <p className="text-gray-400">
          Select the proposals you want to approve. You must be an admin to be able to approve them.
        </p>

        <p className="flex items-center gap-2 text-blue-400">
          <FiAlertCircle className="h-4 w-4" />

          <span>Newly submitted proposals can take 10 minutes to show up.</span>
        </p>

        <div className="mt-6 text-2xl font-extrabold uppercase text-black dark:text-white">{`${(pending.data?.length ?? 0) + (approved.data?.length ?? 0)} requests found`}</div>

        <Form defaultValues={{ selected: [] }} schema={RequestSchema} onSubmit={handleSubmit}>
          {pending.isLoading && (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          )}

          {!pending.isLoading && !pending.data?.length ? (
            <EmptyState title="No pending proposals">
              <Button as={Link} href={`${router.asPath}/new`} variant="primary">
                Go to create proposals
              </Button>
            </EmptyState>
          ) : null}

          <div className="mb-2 flex justify-end">
            <ApproveButton isLoading={approve.isPending} />
          </div>

          <RequestsHeader requests={pending.data ?? []} />

          {pending.data?.map((item) => (
            <ProposalItem key={item.index} {...item} isApproved={false} isLoading={pending.isLoading} pollId={pollId} />
          ))}

          {approved.data?.map((item) => (
            <ProposalItem key={item.index} {...item} isApproved isLoading={approved.isLoading} pollId={pollId} />
          ))}
        </Form>
      </div>
    </div>
  );
};
