import Image from "next/image";

import { Heading } from "~/components/ui/Heading";
import { Skeleton } from "~/components/ui/Skeleton";
import { Button } from "~/components/ui/Button";
import { config } from "~/config";
import { type Attestation } from "~/utils/fetchAttestations";
import { formatNumber } from "~/utils/formatNumber";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";
import { EProjectState } from "../types";

import { useProjectMetadata } from "../hooks/useProjects";

import { ImpactCategories } from "./ImpactCategories";
import { ProjectAvatar } from "./ProjectAvatar";
import { ProjectBanner } from "./ProjectBanner";

export interface IProjectItemProps {
  attestation: Attestation;
  isLoading: boolean;
  state: EProjectState;
  action: (e: Event) => void;
}

export function ProjectItem({
  attestation,
  isLoading,
  state,
  action,
}: IProjectItemProps) {
  const metadata = useProjectMetadata(attestation?.metadataPtr);
  const appState = useAppState();

  return (
    <article
      data-testid={`project-${attestation.id}`}
      className="group rounded-xl bg-white shadow-lg hover:shadow-sm"
    >
      <div className="opacity-70 transition-opacity group-hover:opacity-100">
        <ProjectBanner profileId={attestation.recipient} />

        <ProjectAvatar className="-mt-8 ml-4" profileId={attestation.recipient} rounded="full" />
      </div>
      <div className="p-4 pt-2">
        <Heading className="truncate" size="lg" as="h3">
          <Skeleton isLoading={isLoading}>{attestation?.name}</Skeleton>
        </Heading>
        <p className="line-clamp-2 h-10 text-sm text-gray-400 dark:text-gray-300">
          <Skeleton isLoading={isLoading} className="w-full">
            {metadata.data?.bio}
          </Skeleton>
        </p>
        <Skeleton isLoading={isLoading} className="w-[100px]">
          <ImpactCategories tags={metadata.data?.impactCategory} />
        </Skeleton>
        {!isLoading && appState === EAppState.VOTING && (
          <div className="flex justify-end pt-6">
            <Skeleton>
              {state === EProjectState.DEFAULT && (
                <Button onClick={action} variant="inverted" size="sm">
                  Add to ballot
                </Button>
              )}
              {state === EProjectState.ADDED && (
                <Button onClick={action} size="sm" variant="primary">
                  Added
                  <Image alt="" width="18" height="18" src="check-white.svg" />
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
  <div className="absolute right-2 top-[100px] z-10 -mt-2 rounded bg-gray-100 p-1 text-sm dark:bg-gray-900">
    <span className="mr-1 font-bold">{formatNumber(amount)}</span>

    <span>{config.tokenName}</span>
  </div>
);
