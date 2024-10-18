import { ClockIcon } from "lucide-react";
import Link from "next/link";
import { useFormContext } from "react-hook-form";

import { Badge } from "~/components/ui/Badge";
import { Checkbox } from "~/components/ui/Form";
import { Skeleton } from "~/components/ui/Skeleton";
import { ProjectAvatar } from "~/features/projects/components/ProjectAvatar";
import { useMetadata } from "~/hooks/useMetadata";
import { formatDate } from "~/utils/time";

import type { Application } from "~/features/applications/types";
import type { Attestation } from "~/utils/types";

export interface IApplicationItemProps extends Attestation {
  isApproved?: boolean;
  isLoading?: boolean;
}

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
      <div className="dark:hover:bg-lighterBlack flex cursor-pointer items-center gap-1 py-4 hover:bg-blue-50 sm:gap-2">
        <label className="flex flex-1 cursor-pointer justify-center sm:p-2">
          <Checkbox disabled={isApproved} value={id} {...form.register(`selected`)} type="checkbox" />
        </label>

        <div className="flex flex-[5] items-center gap-4 sm:flex-[8]">
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
          {isApproved && <Badge variant="success">Approved</Badge>}

          {!isApproved && <Badge variant="pending">Pending</Badge>}
        </div>
      </div>
    </Link>
  );
};
