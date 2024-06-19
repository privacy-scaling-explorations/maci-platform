import Image from "next/image";

import { ProjectAvatar } from "./ProjectAvatar";
import { ProjectBanner } from "./ProjectBanner";
import { Heading } from "~/components/ui/Heading";
import { Skeleton } from "~/components/ui/Skeleton";
import { Button } from "~/components/ui/Button";
import { useProjectMetadata } from "../hooks/useProjects";
import { type Attestation } from "~/utils/fetchAttestations";
import { ImpactCategories } from "./ImpactCategories";
import { formatNumber } from "~/utils/formatNumber";
import { config } from "~/config";
import { getAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";
import { EProjectState } from "../types";

export function ProjectItem({
  attestation,
  isLoading,
  state,
  action,
}: {
  attestation: Attestation;
  isLoading: boolean;
  state: EProjectState;
  action: (e: Event) => void;
}) {
  const metadata = useProjectMetadata(attestation?.metadataPtr);
  const appState = getAppState();

  return (
    <article
      data-testid={`project-${attestation.id}`}
      className="group rounded-xl bg-white shadow-lg hover:shadow-sm"
    >
      <div className="opacity-70 transition-opacity group-hover:opacity-100">
        <ProjectBanner profileId={attestation?.recipient} />
        <ProjectAvatar
          rounded="full"
          className="-mt-8 ml-4"
          profileId={attestation?.recipient}
        />
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
}

export function ProjectItemAwarded({ amount = 0 }) {
  return (
    <div className="absolute right-2 top-[100px] z-10 -mt-2 rounded bg-gray-100 p-1 text-sm dark:bg-gray-900">
      <span className="font-bold">{formatNumber(amount)}</span>{" "}
      {config.tokenName}
    </div>
  );
}
