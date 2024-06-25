import { useMemo } from "react";

import { ProjectBanner } from "~/features/projects/components/ProjectBanner";
import { ProjectAvatar } from "~/features/projects/components/ProjectAvatar";
import { useProjectMetadata } from "../hooks/useProjects";
import { type Attestation } from "~/utils/fetchAttestations";
import { Navigator } from "~/components/ui/Navigator";
import { VotingWidget } from "~/features/projects/components/VotingWidget";
import { ProjectContacts } from "./ProjectContacts";
import { ProjectDescriptionSection } from "./ProjectDescriptionSection";

export interface IProjectDetailsProps {
  projectId: string;
  attestation?: Attestation;
}

const ProjectDetails({
  projectId,
  attestation = undefined,
}: IProjectDetailsProps) {
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
        <Navigator projectName={attestation?.name ?? "project name"} />
      </div>

      <div className="overflow-hidden rounded-3xl">
        <ProjectBanner profileId={attestation?.recipient} size="lg" />
      </div>

      <div className="mb-8 flex items-end gap-4">
        <ProjectAvatar
          rounded="full"
          size={"lg"}
          className="-mt-20 ml-8"
          profileId={attestation?.recipient}
        />
      </div>
      <div className="flex items-center justify-between">
        <h3>{attestation?.name}</h3>
        <VotingWidget projectId={projectId} />
      </div>
      <ProjectContacts
        author={payoutAddress}
        website={websiteUrl}
        github={github?.url}
      />
      <p className="text-gray-400">{bio}</p>
      <div className="my-8 flex flex-col gap-8">
        <p className="text-xl uppercase">
          <b>Impact statements</b>
        </p>
        <ProjectDescriptionSection
          title="contributions"
          description={metadata.data?.contributionDescription}
          links={metadata.data?.contributionLinks}
        />
        <ProjectDescriptionSection
          title="impact"
          description={metadata.data?.impactDescription}
          links={metadata.data?.impactMetrics}
        />
        <ProjectDescriptionSection
          title="past grants and funding"
          description={metadata.data?.impactDescription}
          fundings={fundingSources}
        />
      </div>
    </div>
  );
};

export default ProjectDetails;
