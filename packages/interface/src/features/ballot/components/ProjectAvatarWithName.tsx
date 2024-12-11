import Link from "next/link";
import { Hex } from "viem";

import { ProjectAvatar } from "~/features/projects/components/ProjectAvatar";
import { useProjectById, useProjectMetadata } from "~/features/projects/hooks/useProjects";

interface ProjectAvatarWithNameProps {
  id?: string;
  isLink?: boolean;
  showDescription?: boolean;
  allocation?: number;
  registryAddress: Hex;
  pollId: string;
}

export const ProjectAvatarWithName = ({
  id = "",
  isLink = false,
  showDescription = false,
  allocation = 0,
  registryAddress,
  pollId,
}: ProjectAvatarWithNameProps): JSX.Element => {
  const { data: projects } = useProjectById(id, registryAddress);

  const metadata = useProjectMetadata(projects?.metadataUrl);

  const Component = isLink ? Link : "div";

  return (
    <Component className="flex flex-1 items-center gap-4" href={`/rounds/${pollId}/${id}`} tabIndex={-1}>
      <div className="h-12 w-12">
        <ProjectAvatar rounded="full" size="sm" url={metadata.data?.profileImageUrl} />
      </div>

      <div>
        <div className="font-bold uppercase dark:text-white">{metadata.data?.name}</div>

        <div className="max-h-10 overflow-scroll text-sm text-gray-400">
          <p>{showDescription && (metadata.data?.bio ?? null)}</p>

          <p>{allocation > 0 && `Votes you have allocated: ${allocation}`}</p>
        </div>
      </div>
    </Component>
  );
};
