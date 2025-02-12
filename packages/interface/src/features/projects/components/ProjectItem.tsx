import Image from "next/image";
import Link from "next/link";

import { Button } from "~/components/ui/Button";
import { Skeleton } from "~/components/ui/Skeleton";
import { config } from "~/config";
import { formatNumber } from "~/utils/formatNumber";
import { removeMarkdown } from "~/utils/removeMarkdown";
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
  bio?: string;
  impactCategory?: string[];
  actionButton?: ReactNode;
}

export const ProjectItemContent = ({
  bannerImageUrl = "",
  profileImageUrl = "",
  name = "",
  bio = "",
  impactCategory = undefined,
  actionButton = undefined,
}: IProjectItemContentProps): JSX.Element => (
  <article className="dark:bg-lightBlack shadow-project-card group w-full rounded-[10px] border border-gray-50 bg-white">
    <div className="opacity-70 transition-opacity duration-200 group-hover:opacity-100">
      <ProjectBanner className="!rounded-b-none" size="sm" url={bannerImageUrl} />

      <ProjectAvatar className="-mt-8 ml-4" rounded="full" url={profileImageUrl} />
    </div>

    <div className="flex flex-col gap-5 p-4 pt-2">
      <div className="flex flex-col gap-1">
        <span className="font-sans text-base font-semibold uppercase text-black dark:text-white">{name}</span>

        <span className="line-clamp-2 h-10 font-sans text-sm text-gray-400">{removeMarkdown(bio || "")}</span>
      </div>

      <ImpactCategories tags={impactCategory} />

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
  const bio = recipient.bio ? recipient.bio : metadata.data?.bio;
  const impactCategory = recipient.impactCategory ? recipient.impactCategory : metadata.data?.impactCategory;

  if (isLoading) {
    return (
      <div className="flex h-[325px] w-full animate-pulse items-center justify-center rounded-[10px] bg-gray-100" />
    );
  }

  return (
    <Link href={`/rounds/${pollId}/${recipient.id}`}>
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
        bio={bio}
        impactCategory={impactCategory}
        name={name}
        profileImageUrl={profileImageUrl}
      />
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
