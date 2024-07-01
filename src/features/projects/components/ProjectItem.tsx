import Image from "next/image";

import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { Skeleton } from "~/components/ui/Skeleton";
import { config } from "~/config";
import { type Attestation } from "~/utils/fetchAttestations";
import { formatNumber } from "~/utils/formatNumber";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import { useProjectMetadata } from "../hooks/useProjects";
import { EProjectState } from "../types";

import { ImpactCategories } from "./ImpactCategories";
import { ProjectAvatar } from "./ProjectAvatar";
import { ProjectBanner } from "./ProjectBanner";

export interface IProjectItemProps {
  attestation: Attestation;
  isLoading: boolean;
  state: EProjectState;
  action: (e: Event) => void;
}

export const ProjectItem = ({ attestation, isLoading, state, action }: IProjectItemProps): JSX.Element => {
  const metadata = useProjectMetadata(attestation.metadataPtr);
  const appState = useAppState();

  return (
    <article className="group rounded-xl bg-white shadow-lg hover:shadow-sm" data-testid={`project-${attestation.id}`}>
      <div className="opacity-70 transition-opacity group-hover:opacity-100">
        <ProjectBanner profileId={attestation.recipient} />

        <ProjectAvatar className="-mt-8 ml-4" profileId={attestation.recipient} rounded="full" />
      </div>

      <div className="p-4 pt-2">
        <Heading as="h3" className="truncate" size="lg">
          <Skeleton isLoading={isLoading}>{attestation.name}</Skeleton>
        </Heading>

        <p className="line-clamp-2 h-10 text-sm text-gray-400 dark:text-gray-300">
          <Skeleton className="w-full" isLoading={isLoading}>
            {metadata.data?.bio}
          </Skeleton>
        </p>

        <Skeleton className="w-[100px]" isLoading={isLoading}>
          <ImpactCategories tags={metadata.data?.impactCategory} />
        </Skeleton>

        {!isLoading && appState === EAppState.VOTING && (
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
                  <Image alt="check-white" height="18" src="check-white.svg" width="18" />
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
