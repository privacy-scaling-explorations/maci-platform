import { ClockIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { Badge } from "~/components/ui/Badge";
import { Checkbox } from "~/components/ui/Form";
import { Skeleton } from "~/components/ui/Skeleton";
import { ProjectAvatar } from "~/features/projects/components/ProjectAvatar";
import { useMetadata } from "~/hooks/useMetadata";
import { removeMarkdown } from "~/utils/removeMarkdown";
import { formatDate } from "~/utils/time";

import type { TRequestToApprove, Metadata } from "../types";
import type { IRecipient, IRecipientContract } from "~/utils/types";

export interface IProposalItemProps {
  index: string;
  recipient: IRecipient | IRecipientContract;
  isApproved?: boolean;
  isLoading?: boolean;
  pollId: string;
}

export const ProposalItem = ({
  index,
  recipient,
  isApproved = false,
  isLoading = false,
  pollId,
}: IProposalItemProps): JSX.Element => {
  const metadata = useMetadata<Metadata>(recipient.metadataUrl);

  const form = useFormContext<TRequestToApprove>();

  const { profileImageUrl } = metadata.data ?? {};
  let shortBio = metadata.data?.shortBio;
  const bio = metadata.data?.bio;
  if (!shortBio && bio) {
    shortBio = bio.substring(0, 140);
  }

  useEffect(() => {
    if (isApproved) {
      const selected = form.watch("selected");
      form.setValue(
        "selected",
        selected.filter((s) => s !== index),
      );
    }
  }, [isApproved, index]);

  return (
    <Link href={`/rounds/${pollId}/${recipient.id}`} target="_blank">
      <div className="dark:hover:bg-lighterBlack flex cursor-pointer items-center gap-1 py-4 hover:bg-blue-50 sm:gap-2">
        <label className="flex flex-1 cursor-pointer justify-center sm:p-2">
          <Checkbox disabled={isApproved} value={index} {...form.register(`selected`)} type="checkbox" />
        </label>

        <div className="flex flex-[5] items-center gap-4 sm:flex-[8]">
          <div className="flex items-center justify-center">
            <ProjectAvatar isLoading={isLoading} size="sm" url={profileImageUrl} />
          </div>

          <div className="flex flex-col">
            <Skeleton className="mb-1 min-h-5 min-w-24" isLoading={isLoading}>
              <span className="uppercase">{metadata.data?.name}</span>
            </Skeleton>

            <div className="text-sm text-gray-400">
              <div>{removeMarkdown(bio || "")}</div>
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
