import Link from "next/link";
import { useMemo, useEffect, useState, useCallback } from "react";
import { FiAlertCircle } from "react-icons/fi";

import { EmptyState } from "~/components/EmptyState";
import { Button } from "~/components/ui/Button";
import { Form } from "~/components/ui/Form";
import { Heading } from "~/components/ui/Heading";
import { Spinner } from "~/components/ui/Spinner";
import { useApplications } from "~/features/applications/hooks/useApplications";
import { fetchApprovedApplications } from "~/utils/fetchAttestationsWithoutCache";

import type { Attestation } from "~/utils/types";

import { useApproveApplication } from "../hooks/useApproveApplication";
import { useApprovedApplications } from "../hooks/useApprovedApplications";
import { ApplicationsToApproveSchema, type TApplicationsToApprove } from "../types";

import { ApplicationHeader } from "./ApplicationHeader";
import { ApplicationItem } from "./ApplicationItem";
import { ApproveButton } from "./ApproveButton";

interface IApplicationsToApproveProps {
  roundId: string;
}

export const ApplicationsToApprove = ({ roundId }: IApplicationsToApproveProps): JSX.Element => {
  const applications = useApplications(roundId);
  const approved = useApprovedApplications(roundId);
  const approve = useApproveApplication({ roundId });
  const [refetchedData, setRefetchedData] = useState<Attestation[]>();

  const approvedById = useMemo(
    () =>
      [...(approved.data ?? []), ...(refetchedData ?? [])].reduce((map, x) => {
        map.set(x.refUID, true);
        return map;
      }, new Map<string, boolean>()),
    [approved.data, refetchedData],
  );

  const applicationsToApprove = applications.data?.filter((application) => !approvedById.get(application.id));

  useEffect(() => {
    const fetchData = async () => {
      const ret = await fetchApprovedApplications(roundId);
      setRefetchedData(ret);
    };

    /// delay refetch data for 5 seconds
    const timeout = setTimeout(() => {
      fetchData();
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [approve.isPending, approve.isSuccess]);

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
          Select the applications you want to approve. You must be a configured admin to approve applications.
        </p>

        <p className="flex items-center gap-2 text-blue-400">
          <FiAlertCircle className="h-4 w-4" />

          <span>Newly submitted applications can take 10 minutes to show up.</span>
        </p>

        <div className="mt-6 text-2xl font-extrabold uppercase text-black dark:text-white">{`${applications.data?.length} applications found`}</div>

        <Form defaultValues={{ selected: [] }} schema={ApplicationsToApproveSchema} onSubmit={handleSubmit}>
          {applications.isLoading && (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          )}

          {!applications.isLoading && !applications.data?.length ? (
            <EmptyState title="No applications">
              <Button as={Link} href="/applications/new" variant="primary">
                Go to create application
              </Button>
            </EmptyState>
          ) : null}

          <div className="mb-2 flex justify-end">
            <ApproveButton isLoading={approve.isPending} />
          </div>

          <ApplicationHeader applications={applicationsToApprove} />

          {applications.data?.map((item) => (
            <ApplicationItem
              key={item.id}
              {...item}
              isApproved={approvedById.get(item.id)}
              isLoading={applications.isLoading}
            />
          ))}
        </Form>
      </div>
    </div>
  );
};
