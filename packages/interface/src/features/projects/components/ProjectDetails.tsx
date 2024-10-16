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

import { ProjectContacts } from "./ProjectContacts";
import { ProjectDescriptionSection } from "./ProjectDescriptionSection";

export interface IProjectDetailsProps {
  action?: ReactNode;
  projectId?: string;
  attestation?: Attestation;
}

const ProjectDetails = ({
  projectId = "",
  attestation = undefined,
  action = undefined,
}: IProjectDetailsProps): JSX.Element => {
  const metadata = useProjectMetadata(attestation?.metadataPtr);

  const { bio, websiteUrl, payoutAddress, github, twitter, fundingSources, profileImageUrl, bannerImageUrl } =
    metadata.data ?? {};

  const appState = useAppState();

  return (
    <div className="relative dark:text-white ">
      <div className="mb-7 px-2">
        <Navigation projectName={attestation?.name ?? "project name"} />
      </div>

      <div className="overflow-hidden rounded-3xl">
        <ProjectBanner size="lg" url={bannerImageUrl} />
      </div>

      <div className="mb-8 flex items-end gap-4">
        <ProjectAvatar className="-mt-20 ml-8" rounded="full" size="lg" url={profileImageUrl} />
      </div>

      <div className="flex flex-col items-center justify-between px-2 sm:flex-row">
        <Heading as="h3" size="3xl">
          {attestation?.name}
        </Heading>

        {appState === EAppState.VOTING && <VotingWidget projectId={projectId} />}
      </div>

      <ProjectContacts author={payoutAddress} github={github} twitter={twitter} website={websiteUrl} />

      <p className="px-2 text-gray-400 ">{bio}</p>

      <div className="my-8 flex flex-col gap-8 px-2">
        <p className="text-xl uppercase">
          <b>Impact statements</b>
        </p>

        <ProjectDescriptionSection
          contributions={metadata.data?.contributionLinks}
          description={metadata.data?.contributionDescription}
          title="contributions"
        />

        <ProjectDescriptionSection
          description={metadata.data?.impactDescription}
          fundings={fundingSources}
          title="past grants and funding"
        />

        {action}
      </div>
    </div>
  );
};

export default ProjectDetails;
