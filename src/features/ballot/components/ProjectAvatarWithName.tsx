import Link from "next/link";

import { ProjectAvatar } from "~/features/projects/components/ProjectAvatar";
import {
  useProjectById,
  useProjectMetadata,
} from "~/features/projects/hooks/useProjects";

interface ProjectAvatarWithNameProps {
  id?: string;
  isLink?: boolean;
  showDescription?: boolean;
  allocation?: number;
}

export const ProjectAvatarWithName = ({
  id,
  isLink,
  showDescription,
  allocation,
}: ProjectAvatarWithNameProps) => {
  const { data: project } = useProjectById(id!);
  const metadata = useProjectMetadata(project?.metadataPtr);

  const Component = isLink ? Link : "div";

  return (
    <Component
      tabIndex={-1}
      className="flex flex-1 items-center gap-4"
      href={`/projects/${id}`}
    >
      <ProjectAvatar rounded="full" size="sm" profileId={project?.recipient} />
      <div>
        <div className="font-bold uppercase">{project?.name}</div>
        <div className="text-sm text-gray-400">
          <p>{showDescription && (metadata.data?.bio ?? null)}</p>
          <p>{allocation && `Votes you have allocated: ${allocation}`}</p>
        </div>
      </div>
    </Component>
  );
};
