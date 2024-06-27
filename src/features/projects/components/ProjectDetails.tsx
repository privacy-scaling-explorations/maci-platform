import { useMemo, type ReactNode } from "react";

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
}

const ProjectDetails = ({
  projectId = "",
  attestation = undefined,
  action = undefined,
}: IProjectDetailsProps): JSX.Element => {
  const metadata = useProjectMetadata(attestation?.metadataPtr);

  const { bio, websiteUrl, payoutAddress, fundingSources } = metadata.data ?? {};

  const github = useMemo(
    () =>
      metadata.data?.contributionLinks
        ? metadata.data.contributionLinks.find((l) => l.type === "GITHUB_REPO")
        : undefined,
    [metadata, useProjectMetadata],
  );

  return (
    <div className="relative">
      <div className="mb-7">
        <Navigation projectName={attestation?.name ?? "project name"} />
      </div>

      <div className="overflow-hidden rounded-3xl">
        <ProjectBanner profileId={attestation?.recipient} size="lg" />
      </div>

      <div className="mb-8 flex items-end gap-4">
        <ProjectAvatar className="-mt-20 ml-8" profileId={attestation?.recipient} rounded="full" size="lg" />
      </div>

      <div className="flex items-center justify-between">
        <h3>{attestation?.name}</h3>

        <VotingWidget projectId={projectId} />
      </div>

      <ProjectContacts author={payoutAddress} github={github?.url} website={websiteUrl} />

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
          impacts={metadata.data?.impactMetrics}
          title="impact"
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
