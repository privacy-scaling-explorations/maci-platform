import Image from "next/image";

import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { Skeleton } from "~/components/ui/Skeleton";
import { config } from "~/config";
import { formatNumber } from "~/utils/formatNumber";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { IRecipient } from "~/utils/types";

import { useProjectMetadata } from "../hooks/useProjects";
import { EProjectState } from "../types";

import { ImpactCategories } from "./ImpactCategories";
import { ProjectAvatar } from "./ProjectAvatar";
import { ProjectBanner } from "./ProjectBanner";

export interface IProjectItemProps {
  pollId: string;
  recipient: IRecipient;
  isLoading: boolean;
  state?: EProjectState;
  action?: (e: Event) => void;
}

export const ProjectItem = ({
  pollId,
  recipient,
  isLoading,
  state = undefined,
  action = undefined,
}: IProjectItemProps): JSX.Element => {
  const metadata = useProjectMetadata(recipient.metadataUrl);
  const roundState = useRoundState({ pollId });

  return (
    <article
      className="dark:bg-lightBlack group w-96 rounded-xl bg-white shadow-lg hover:shadow-sm sm:w-full"
      data-testid={`project-${recipient.id}`}
    >
      <div className="opacity-70 transition-opacity group-hover:opacity-100">
        <ProjectBanner url={metadata.data?.bannerImageUrl} />

        <ProjectAvatar className="-mt-8 ml-4" rounded="full" url={metadata.data?.profileImageUrl} />
      </div>

      <div className="p-4 pt-2">
        <Heading as="h3" className="truncate dark:text-white" size="lg">
          <Skeleton isLoading={isLoading}>{metadata.data?.name}</Skeleton>
        </Heading>

        <div className="line-clamp-2 h-10 text-sm text-gray-400">
          <Skeleton className="w-full" isLoading={isLoading}>
            {metadata.data?.bio}
          </Skeleton>
        </div>

        <Skeleton className="w-[100px]" isLoading={isLoading}>
          <ImpactCategories tags={metadata.data?.impactCategory} />
        </Skeleton>

        {!isLoading && state !== undefined && action && roundState === ERoundState.VOTING && (
          <div className="flex justify-end pt-6">
            <Skeleton>
              {state === EProjectState.DEFAULT && (
                <Button size="sm" variant="inverted" onClick={action}>
                  Add to ballot
                </Button>
              )}

              {state === EProjectState.ADDED && (
                <Button size="sm" variant="primary" onClick={action}>
                  Added
                  <Image alt="check-white" height="18" src="/check-white.svg" width="18" />
                </Button>
              )}

              {state === EProjectState.SUBMITTED && (
                <Button size="sm" variant="disabled">
                  Submitted
                </Button>
              )}
            </Skeleton>
          </div>
        )}
      </div>
    </article>
  );
};

export interface IProjectItemAwardedProps {
  amount?: number;
}

export const ProjectItemAwarded = ({ amount = 0 }: IProjectItemAwardedProps): JSX.Element => (
  <div className="absolute right-2 top-[100px] z-10 -mt-2 rounded bg-gray-100 p-1 text-sm">
    <span className="mr-1 font-bold">{formatNumber(amount)}</span>

    <span>{config.tokenName}</span>
  </div>
);
