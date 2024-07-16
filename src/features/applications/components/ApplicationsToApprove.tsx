import { ClockIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { FiAlertCircle } from "react-icons/fi";
import { z } from "zod";

import { EmptyState } from "~/components/EmptyState";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Checkbox, Form } from "~/components/ui/Form";
import { Skeleton } from "~/components/ui/Skeleton";
import { Spinner } from "~/components/ui/Spinner";
import { useApplications } from "~/features/applications/hooks/useApplications";
import { type Application } from "~/features/applications/types";
import { ProjectAvatar } from "~/features/projects/components/ProjectAvatar";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";
import { useMetadata } from "~/hooks/useMetadata";
import { type Attestation } from "~/utils/fetchAttestations";
import { formatDate } from "~/utils/time";

import { useApproveApplication } from "../hooks/useApproveApplication";
import { useApprovedApplications } from "../hooks/useApprovedApplications";

export interface IApplicationItemProps extends Attestation {
  isApproved?: boolean;
  isLoading?: boolean;
}

const SelectAllButton = ({ applications = [] }: { applications: Attestation[] | undefined }) => {
  const form = useFormContext<TApplicationsToApprove>();
  const selected = form.watch("selected");
  const isAllSelected = selected.length > 0 && selected.length === applications.length;
  return (
    <Button
      disabled={!applications.length}
      type="button"
      onClick={() => {
        const selectAll = isAllSelected ? [] : applications.map(({ id }) => id);
        form.setValue("selected", selectAll);
      }}
    >
      {isAllSelected ? "Deselect all" : "Select all"}
    </Button>
  );
};

interface IApproveButtonProps {
  isLoading?: boolean;
}

const ApproveButton = ({ isLoading = false }: IApproveButtonProps): JSX.Element => {
  const isAdmin = useIsAdmin();
  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();
  const form = useFormContext<TApplicationsToApprove>();
  const selectedCount = Object.values(form.watch("selected")).filter(Boolean).length;

  const text = isAdmin ? `Approve ${selectedCount} applications` : "You must be an admin";

  return (
    <Button
      suppressHydrationWarning
      disabled={!selectedCount || !isAdmin || isLoading || !isCorrectNetwork}
      size="auto"
      type="submit"
      variant="primary"
    >
      {!isCorrectNetwork ? `Connect to ${correctNetwork.name}` : text}
    </Button>
  );
};

const ApplicationHeader = ({ applications = [] }: { applications: Attestation[] | undefined }): JSX.Element => (
  <div className="flex items-center bg-gray-50 py-4 dark:bg-lighterBlack">
    <div className="flex-1 justify-center">
      <SelectAllButton applications={applications} />
    </div>

    <div className="flex-[8] pl-6">Project</div>

    <div className="flex-[3]">Submitted on</div>

    <div className="flex-[2]">Status</div>
  </div>
);

export const ApplicationItem = ({
  id,
  recipient,
  name,
  metadataPtr,
  time,
  isApproved = false,
  isLoading = false,
}: IApplicationItemProps): JSX.Element => {
  const metadata = useMetadata<Application>(metadataPtr);

  const form = useFormContext();

  const { fundingSources = [], profileImageUrl } = metadata.data ?? {};

  return (
    <Link href={`/projects/${id}`} target="_blank">
      <div className="flex cursor-pointer items-center gap-2 py-4 hover:bg-blue-50 dark:hover:bg-lighterBlack">
        <label className="flex flex-1 cursor-pointer justify-center p-2">
          <Checkbox disabled={isApproved} value={id} {...form.register(`selected`)} type="checkbox" />
        </label>

        <div className="flex flex-[8] items-center gap-4">
          <ProjectAvatar isLoading={isLoading} profileId={recipient} size="sm" url={profileImageUrl} />

          <div className="flex flex-col">
            <Skeleton className="mb-1 min-h-5 min-w-24" isLoading={isLoading}>
              <span className="uppercase">{name}</span>
            </Skeleton>

            <div className="text-sm text-gray-400">
              <div>{fundingSources.length} funding sources</div>
            </div>
          </div>
        </div>

        <div className="flex flex-[3] items-center gap-2 text-xs text-gray-700">
          <ClockIcon className="size-3" />

          <Skeleton className="mb-1 min-h-5 min-w-24" isLoading={isLoading}>
            {formatDate(time * 1000)}
          </Skeleton>
        </div>

        <div className="flex-[2]">
          {isApproved ? <Badge variant="success">Approved</Badge> : <Badge variant="pending">Pending</Badge>}
        </div>
      </div>
    </Link>
  );
};

const ApplicationsToApproveSchema = z.object({
  selected: z.array(z.string()),
});

type TApplicationsToApprove = z.infer<typeof ApplicationsToApproveSchema>;

export const ApplicationsToApprove = (): JSX.Element => {
  const applications = useApplications();
  const approved = useApprovedApplications();
  const approve = useApproveApplication({});

  const approvedById = useMemo(
    () =>
      approved.data?.reduce((map, x) => {
        map.set(x.refUID, true);
        return map;
      }, new Map<string, boolean>()),
    [approved.data],
  );

  const applicationsToApprove = applications.data?.filter((application) => !approvedById?.get(application.id));

  return (
    <div className="flex w-full justify-center dark:text-white">
      <div className="flex flex-col gap-4 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg">
        <h3>Review Applications</h3>

        <p className="text-gray-400">
          Select the applications you want to approve. You must be a configured admin to approve applications.
        </p>

        <p className="flex items-center gap-2 text-blue-400">
          <FiAlertCircle className="h-4 w-4" />

          <span>Newly submitted applications can take 10 minutes to show up.</span>
        </p>

        <div className="mt-6 text-2xl font-extrabold uppercase text-black dark:text-white">{`${applications.data?.length} applications found`}</div>

        <Form
          defaultValues={{ selected: [] }}
          schema={ApplicationsToApproveSchema}
          onSubmit={(values) => {
            approve.mutate(values.selected);
          }}
        >
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
              isApproved={approvedById?.get(item.id)}
              isLoading={applications.isLoading}
            />
          ))}
        </Form>
      </div>
    </div>
  );
};
