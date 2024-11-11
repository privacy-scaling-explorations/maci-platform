import { type ReactNode } from "react";

import { Heading } from "~/components/ui/Heading";
import { Navigation } from "~/components/ui/Navigation";
import { ProjectAvatar } from "~/features/projects/components/ProjectAvatar";
import { ProjectBanner } from "~/features/projects/components/ProjectBanner";

import type { IRecipient } from "~/utils/types";

import { useProjectMetadata } from "../hooks/useProjects";

import { ProjectContacts } from "./ProjectContacts";

export interface IProjectDetailsProps {
  pollId: string;
  action?: ReactNode;
  project: IRecipient;
}

const ProjectDetails = ({ pollId, project, action = undefined }: IProjectDetailsProps): JSX.Element => {
  const metadata = useProjectMetadata(project.metadataUrl);

  const { bio, author, websiteUrl, payoutAddress, github, twitter, farcaster, profileImageUrl, bannerImageUrl } =
    metadata.data ?? {};

  return (
    <div className="relative dark:text-white">
      <div className="mb-7 px-2">
        <Navigation pollId={pollId} projectName={metadata.data?.name ?? "dashboard name"} />
      </div>

      <div className="overflow-hidden rounded-3xl">
        <ProjectBanner size="lg" url={bannerImageUrl} />
      </div>

      <div className="mb-8 flex items-end gap-4">
        <ProjectAvatar className="-mt-20 ml-8" rounded="full" size="lg" url={profileImageUrl} />
      </div>

      <div className="flex flex-col items-center justify-between px-2 sm:flex-row">
        <Heading as="h3" size="3xl">
          {metadata.data?.name}
        </Heading>
      </div>

      <ProjectContacts
        farcaster={farcaster}
        github={github}
        payoutAddress={payoutAddress}
        twitter={twitter}
        website={websiteUrl}
      />

      <Heading as="h4" className="px-2" size="xl">
        Author
      </Heading>

      <p className="px-2 text-gray-400">{author}</p>

      <Heading as="h4" className="mt-4 px-2" size="xl">
        What does your dashboard show? What does it help others to understand and how? Why is it relevant for Ethereum?
      </Heading>

      <p className="px-2 text-gray-400">{bio}</p>

      {action}
    </div>
  );
};

export default ProjectDetails;
