import { Heading } from "~/components/ui/Heading";
import { Skeleton } from "~/components/ui/Skeleton";
import { config } from "~/config";
import { type Attestation } from "~/utils/fetchAttestations";
import { formatNumber } from "~/utils/formatNumber";

import { useProjectMetadata } from "../hooks/useProjects";

import { ImpactCategories } from "./ImpactCategories";
import { ProjectAvatar } from "./ProjectAvatar";
import { ProjectBanner } from "./ProjectBanner";

export interface IProjectItemProps {
  attestation: Attestation;
  isLoading: boolean;
}

export const ProjectItem = ({ attestation, isLoading }: IProjectItemProps): JSX.Element => {
  const metadata = useProjectMetadata(attestation.metadataPtr);

  return (
    <article
      className="group rounded-2xl border border-gray-200 p-2 hover:border-primary-500 dark:border-gray-700 dark:hover:border-primary-500"
      data-testid={`project-${attestation.id}`}
    >
      <div className="opacity-70 transition-opacity group-hover:opacity-100">
        <ProjectBanner profileId={attestation.recipient} />

        <ProjectAvatar className="-mt-8 ml-4" profileId={attestation.recipient} rounded="full" />
      </div>

      <Heading as="h3" className="truncate" size="lg">
        <Skeleton isLoading={isLoading}>{attestation.name}</Skeleton>
      </Heading>

      <div className="mb-2">
        <p className="line-clamp-2 h-10 text-sm dark:text-gray-300">
          <Skeleton className="w-full" isLoading={isLoading}>
            {metadata.data?.bio}
          </Skeleton>
        </p>
      </div>

      <Skeleton className="w-[100px]" isLoading={isLoading}>
        <ImpactCategories tags={metadata.data?.impactCategory} />
      </Skeleton>
    </article>
  );
};

export interface IProjectItemAwardedProps {
  amount?: number;
}

export const ProjectItemAwarded = ({ amount = 0 }: IProjectItemAwardedProps): JSX.Element => (
  <div className="absolute right-2 top-[100px] z-10 -mt-2 rounded bg-gray-100 p-1 text-sm dark:bg-gray-900">
    <span className="mr-1 font-bold">{formatNumber(amount)}</span>

    <span>{config.tokenName}</span>
  </div>
);
