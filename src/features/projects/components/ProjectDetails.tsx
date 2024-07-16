import clsx from "clsx";
import { type ReactNode } from "react";

import { Navigation } from "~/components/ui/Navigation";
import { ProjectAvatar } from "~/features/projects/components/ProjectAvatar";
import { ProjectBanner } from "~/features/projects/components/ProjectBanner";
import { VotingWidget } from "~/features/projects/components/VotingWidget";
import { type Attestation } from "~/utils/fetchAttestations";

import { useProjectMetadata } from "../hooks/useProjects";

import { ProjectContacts } from "./ProjectContacts";
import { ProjectDescriptionSection } from "./ProjectDescriptionSection";

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

  const { bio, websiteUrl, payoutAddress, github, twitter, fundingSources, profileImageUrl, bannerImageUrl } =
    metadata.data ?? {};

  return (
    <div className={clsx("relative dark:text-white", disabled && "opacity-30")}>
      <div className="mb-7">
        <Navigation projectName={attestation?.name ?? "project name"} />
      </div>

      <div className="overflow-hidden rounded-3xl">
        <ProjectBanner size="lg" url={bannerImageUrl} />
      </div>

      <div className="mb-8 flex items-end gap-4">
        <ProjectAvatar className="-mt-20 ml-8" rounded="full" size="lg" url={profileImageUrl} />
      </div>

      <div className="flex items-center justify-between">
        <h3>{attestation?.name}</h3>

        <VotingWidget projectId={projectId} />
      </div>

      <ProjectContacts author={payoutAddress} github={github} twitter={twitter} website={websiteUrl} />

      <p className="text-gray-400">{bio}</p>

      <div className="my-8 flex flex-col gap-8">
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
