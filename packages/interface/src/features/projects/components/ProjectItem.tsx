import Image from "next/image";
import Link from "next/link";

import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { Skeleton } from "~/components/ui/Skeleton";
import { Spinner } from "~/components/ui/Spinner";
import { config } from "~/config";
import { formatNumber } from "~/utils/formatNumber";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { ReactNode } from "react";
import type { IRecipient } from "~/utils/types";

import { useProjectMetadata } from "../hooks/useProjects";
import { EProjectState } from "../types";

import { ImpactCategories } from "./ImpactCategories";
import { ProjectAvatar } from "./ProjectAvatar";
import { ProjectBanner } from "./ProjectBanner";

export interface IProjectItemContentProps {
  bannerImageUrl?: string;
  profileImageUrl?: string;
  name?: string;
  shortBio?: string;
  impactCategory?: string[];
  actionButton?: ReactNode;
}

export const ProjectItemContent = ({
  bannerImageUrl = "",
  profileImageUrl = "",
  name = "",
  shortBio = "",
  impactCategory = undefined,
  actionButton = undefined,
}: IProjectItemContentProps): JSX.Element => (
  <article className="dark:bg-lightBlack group w-full rounded-xl bg-white shadow-lg hover:shadow-sm">
    <div className="opacity-70 transition-opacity group-hover:opacity-100">
      <ProjectBanner url={bannerImageUrl} />

      <ProjectAvatar className="-mt-8 ml-4" rounded="full" url={profileImageUrl} />
    </div>

    <div className="p-4 pt-2">
      <Heading as="h3" className="truncate dark:text-white" size="lg">
        <Skeleton>{name}</Skeleton>
      </Heading>

      <div className="mb-2 line-clamp-2 h-10 text-sm text-gray-400">
        <Skeleton className="w-full" isLoading={false}>
          {shortBio}
        </Skeleton>
      </div>

      <Skeleton className="w-[100px]" isLoading={false}>
        <ImpactCategories tags={impactCategory} />
      </Skeleton>

      {actionButton}
    </div>
  </article>
);

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
  const bannerImageUrl = recipient.bannerImageUrl ? recipient.bannerImageUrl : metadata.data?.bannerImageUrl;
  const profileImageUrl = recipient.profileImageUrl ? recipient.profileImageUrl : metadata.data?.profileImageUrl;
  const name = recipient.name ? recipient.name : metadata.data?.name;
  let shortBio = recipient.shortBio ? recipient.shortBio : metadata.data?.shortBio;
  const bio = recipient.bio ? recipient.bio : metadata.data?.bio;
  if (!shortBio && bio) {
    shortBio = bio.substring(0, 140);
  }
  const impactCategory = recipient.impactCategory ? recipient.impactCategory : metadata.data?.impactCategory;

  return (
    <Link href={`/rounds/${pollId}/${recipient.id}`}>
      {isLoading && <Spinner className="h-16 w-16" />}

      {!isLoading && (
        <ProjectItemContent
          actionButton={
            state !== undefined &&
            action &&
            roundState === ERoundState.VOTING && (
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
            )
          }
          bannerImageUrl={bannerImageUrl}
          impactCategory={impactCategory}
          name={name}
          profileImageUrl={profileImageUrl}
          shortBio={shortBio}
        />
      )}
    </Link>
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
