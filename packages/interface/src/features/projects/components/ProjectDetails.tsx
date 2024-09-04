import clsx from "clsx";
import { type ReactNode } from "react";

import { Heading } from "~/components/ui/Heading";
import { Navigation } from "~/components/ui/Navigation";
import { ProjectAvatar } from "~/features/projects/components/ProjectAvatar";
import { ProjectBanner } from "~/features/projects/components/ProjectBanner";
import { VotingWidget } from "~/features/projects/components/VotingWidget";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import type { Attestation } from "~/utils/types";

import { useProjectMetadata } from "../hooks/useProjects";

export interface IProjectDetailsProps {
  action?: ReactNode;
  projectId?: string;
  attestation?: Attestation;
  disabled?: boolean;
}

const ProjectDetails = ({
  projectId = "",
  attestation = undefined,
  action = undefined,
  disabled = false,
}: IProjectDetailsProps): JSX.Element => {
  const metadata = useProjectMetadata(attestation?.metadataPtr);

  const { bio, activitiesDescription, profileImageUrl, bannerImageUrl } = metadata.data ?? {};

  const appState = useAppState();

  return (
    <div className={clsx("relative dark:text-white", disabled && "opacity-30")}>
      <div className="mb-7">
        <Navigation projectName={attestation?.name ?? "project name"} />
      </div>

      <div className=" rounded-3xl">
        <ProjectBanner size="lg" url={bannerImageUrl} />
      </div>

      <div className="mb-8 flex items-end gap-4">
        <ProjectAvatar className="-mt-20 ml-8" rounded="full" size="lg" url={profileImageUrl} />
      </div>

      <div className="flex items-center justify-between">
        <Heading as="h3" size="3xl">
          {attestation?.name}
        </Heading>

        {appState === EAppState.VOTING && <VotingWidget projectId={projectId} />}
      </div>

      <p className="text-gray-400">{bio}</p>

      <div className="my-4 flex flex-col gap-2">
        <p className="text-xl uppercase">
          <b>Activities</b>
        </p>

        <p className="text-gray-400">{activitiesDescription}</p>

        <p className="text-xl uppercase">
          <b>Pictures</b>
        </p>

        <div className="mb-8 flex items-end gap-4">
          <ProjectAvatar className="rounded-lg" size="xl" url={profileImageUrl} />

          <ProjectAvatar className="rounded-lg" size="xl" url={bannerImageUrl} />
        </div>

        {action}
      </div>
    </div>
  );
};

export default ProjectDetails;
