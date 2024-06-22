import { ClockIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { EmptyState } from "~/components/EmptyState";
import { Alert } from "~/components/ui/Alert";
import { Badge } from "~/components/ui/Badge";
import { Button } from "~/components/ui/Button";
import { Checkbox, Form } from "~/components/ui/Form";
import { Markdown } from "~/components/ui/Markdown";
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
      type="submit"
      variant="primary"
    >
      {!isCorrectNetwork ? `Connect to ${correctNetwork.name}` : text}
    </Button>
  );
};

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

  const { bio, fundingSources = [], impactMetrics = [] } = metadata.data ?? {};

  return (
    <div className="flex items-center gap-2 rounded border-b dark:border-gray-800 hover:dark:bg-gray-800">
      <label className="flex flex-1 cursor-pointer items-center gap-4 p-2">
        <Checkbox disabled={isApproved} value={id} {...form.register(`selected`)} type="checkbox" />

        <ProjectAvatar isLoading={isLoading} profileId={recipient} size="sm" />

        <div className=" flex-1">
          <div className="flex items-center justify-between">
            <Skeleton className="mb-1 min-h-5 min-w-24" isLoading={isLoading}>
              {name}
            </Skeleton>
          </div>

          <div>
            <div className="flex gap-4 text-xs dark:text-gray-400">
              <div>{fundingSources.length} funding sources</div>

              <div>{impactMetrics.length} impact metrics</div>
            </div>

            <div className="line-clamp-2 text-sm dark:text-gray-300">{bio}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-400">
          <ClockIcon className="size-3" />

          <Skeleton className="mb-1 min-h-5 min-w-24" isLoading={isLoading}>
            {formatDate(time * 1000)}
          </Skeleton>
        </div>

        {isApproved ? <Badge variant="success">Approved</Badge> : <Badge>Pending</Badge>}

        <Button
          as={Link}
          className="transition-transform group-data-[state=closed]:rotate-180"
          disabled={isLoading}
          href={`/applications/${id}`}
          target="_blank"
          type="button"
          variant=""
        >
          Review
        </Button>
      </label>
    </div>
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
    <Form
      defaultValues={{ selected: [] }}
      schema={ApplicationsToApproveSchema}
      onSubmit={(values) => {
        approve.mutate(values.selected);
      }}
    >
      <Markdown>{`### Review applications
Select the applications you want to approve. You must be a configured admin to approve applications.

`}</Markdown>

      <Alert>Newly submitted applications can take 10 minutes to show up.</Alert>

      <div className="my-2 flex items-center justify-between">
        <div className="text-gray-300">
          {applications.data?.length ? `${applications.data.length} applications found` : ""}
        </div>

        <div className="flex gap-2">
          <SelectAllButton applications={applicationsToApprove} />

          <ApproveButton isLoading={approve.isPending} />
        </div>
      </div>

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

      {applications.data?.map((item) => (
        <ApplicationItem
          key={item.id}
          {...item}
          isApproved={approvedById?.get(item.id)}
          isLoading={applications.isLoading}
        />
      ))}
    </Form>
  );
};
