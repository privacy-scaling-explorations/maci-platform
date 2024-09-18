import Link from "next/link";

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
  const { data: projects } = useProjectById(id);
  const metadata = useProjectMetadata(projects?.[0]?.metadataPtr);

  const Component = isLink ? Link : "div";

  return (
    <Component className="flex flex-1 items-center gap-4" href={`/projects/${id}`} tabIndex={-1}>
      <ProjectAvatar size="lg" url={metadata.data?.profileImageUrl} />

      <div>
        <div className="font-bold uppercase">{projects?.[0]?.name}</div>

        <div className="text-sm text-gray-400">
          <p>{allocation > 0 && `Votes you have allocated: ${allocation}`}</p>
        </div>
      </div>
    </Component>
  );
};
