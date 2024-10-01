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
import type { IRecipient, IRecipientContract } from "~/utils/types";

export interface IApplicationItemProps {
  index: string;
  recipient: IRecipient | IRecipientContract;
  isApproved?: boolean;
  isLoading?: boolean;
}

export const ApplicationItem = ({
  index,
  recipient,
  isApproved = false,
  isLoading = false,
}: IApplicationItemProps): JSX.Element => {
  const metadata = useMetadata<Application>(recipient.metadataUrl);

  const form = useFormContext();

  const { fundingSources = [], profileImageUrl } = metadata.data ?? {};

  return (
    <Link href={`/projects/${recipient.id}`} target="_blank">
      <div className="dark:hover:bg-lighterBlack flex cursor-pointer items-center gap-2 py-4 hover:bg-blue-50">
        <label className="flex flex-1 cursor-pointer justify-center p-2">
          <Checkbox disabled={isApproved} value={index} {...form.register(`selected`)} type="checkbox" />
        </label>

        <div className="flex flex-[8] items-center gap-4">
          <ProjectAvatar isLoading={isLoading} size="sm" url={profileImageUrl} />

          <div className="flex flex-col">
            <Skeleton className="mb-1 min-h-5 min-w-24" isLoading={isLoading}>
              <span className="uppercase">{metadata.data?.name}</span>
            </Skeleton>

            <div className="text-sm text-gray-400">
              <div>{fundingSources.length} funding sources</div>
            </div>
          </div>
        </div>

        <div className="flex flex-[3] items-center gap-2 text-xs text-gray-700">
          <ClockIcon className="size-3" />

          <Skeleton className="mb-1 min-h-5 min-w-24" isLoading={isLoading}>
            {metadata.data?.submittedAt ? formatDate(metadata.data.submittedAt) : "N/A"}
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
