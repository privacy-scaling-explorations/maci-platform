import Link from "next/link";
import { useEffect, useCallback, useMemo } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { zeroAddress } from "viem";

import { EmptyState } from "~/components/EmptyState";
import { Button } from "~/components/ui/Button";
import { Form } from "~/components/ui/Form";
import { Heading } from "~/components/ui/Heading";
import { Spinner } from "~/components/ui/Spinner";
import { useRound } from "~/contexts/Round";
import { useApprovedApplications, usePendingApplications } from "~/features/applications/hooks/useApplications";

import { useApproveApplication } from "../hooks/useApproveApplication";
import { ApplicationsToApproveSchema, type TApplicationsToApprove } from "../types";

import { ApplicationHeader } from "./ApplicationHeader";
import { ApplicationItem } from "./ApplicationItem";
import { ApproveButton } from "./ApproveButton";

interface IApplicationsToApproveProps {
  pollId: string;
}

/**
 * Displays the applications that are pending approval.
 */
export const ApplicationsToApprove = ({ pollId }: IApplicationsToApproveProps): JSX.Element => {
  const { getRoundByPollId } = useRound();

  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);
  const approved = useApprovedApplications(round?.registryAddress ?? zeroAddress);
  const pending = usePendingApplications(round?.registryAddress ?? zeroAddress);
  const approve = useApproveApplication({});

  useEffect(() => {
    approved.refetch().catch();
    pending.refetch().catch();
  }, [approve.isSuccess, approve.isPending, approve.isError]);

  const handleSubmit = useCallback(
    (values: TApplicationsToApprove) => {
      approve.mutate(values.selected);
    },
    [approve],
  );

  return (
    <div className="flex w-full justify-center dark:text-white">
      <div className="flex flex-col gap-4 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg">
        <Heading as="h3" size="3xl">
          Review Applications
        </Heading>

        <p className="text-gray-400">
          Select the applications you want to approve. You must be an admin to be able to approve applications.
        </p>

        <p className="flex items-center gap-2 text-blue-400">
          <FiAlertCircle className="h-4 w-4" />

          <span>Newly submitted applications can take 10 minutes to show up.</span>
        </p>

        <div className="mt-6 text-2xl font-extrabold uppercase text-black dark:text-white">{`${(pending.data?.length ?? 0) + (approved.data?.length ?? 0)} applications found`}</div>

        <Form defaultValues={{ selected: [] }} schema={ApplicationsToApproveSchema} onSubmit={handleSubmit}>
          {pending.isLoading && (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          )}

          {!pending.isLoading && !pending.data?.length ? (
            <EmptyState title="No pending applications">
              <Button as={Link} href={`/rounds/${pollId}/applications/new`} variant="primary">
                Go to create application
              </Button>
            </EmptyState>
          ) : null}

          <div className="mb-2 flex justify-end">
            <ApproveButton isLoading={approve.isPending} />
          </div>

          <ApplicationHeader applications={pending.data ?? []} />

          {pending.data?.map((item) => (
            <ApplicationItem
              key={item.index}
              {...item}
              isApproved={false}
              isLoading={pending.isLoading}
              pollId={pollId}
            />
          ))}

          {approved.data?.map((item) => (
            <ApplicationItem key={item.index} {...item} isApproved isLoading={approved.isLoading} pollId={pollId} />
          ))}
        </Form>
      </div>
    </div>
  );
};
