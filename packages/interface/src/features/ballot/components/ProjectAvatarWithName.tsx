import Link from "next/link";
import { zeroAddress } from "viem";

import { useMaci } from "~/contexts/Maci";
import { ProjectAvatar } from "~/features/projects/components/ProjectAvatar";
import { useProjectById, useProjectMetadata } from "~/features/projects/hooks/useProjects";

interface ProjectAvatarWithNameProps {
  id?: string;
  isLink?: boolean;
  showDescription?: boolean;
  allocation?: number;
}

export const ProjectAvatarWithName = ({
  id = "",
  isLink = false,
  showDescription = false,
  allocation = 0,
}: ProjectAvatarWithNameProps): JSX.Element => {
  const { pollData } = useMaci();

  const { data: projects } = useProjectById(id, pollData?.registry ?? zeroAddress);
  const metadata = useProjectMetadata(projects?.metadataUrl);

  const Component = isLink ? Link : "div";

  return (
    <Component className="flex flex-1 items-center gap-4" href={`/projects/${id}`} tabIndex={-1}>
      <ProjectAvatar rounded="full" size="sm" url={metadata.data?.bannerImageUrl} />

      <div>
        <div className="font-bold uppercase">{metadata.data?.name}</div>

        <div className="text-sm text-gray-400">
          <p>{showDescription && (metadata.data?.bio ?? null)}</p>

          <p>{allocation > 0 && `Votes you have allocated: ${allocation}`}</p>
        </div>
      </div>
    </Component>
  );
};
