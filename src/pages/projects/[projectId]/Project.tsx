import { type GetServerSideProps } from "next";

import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import ProjectDetails from "~/features/projects/components/ProjectDetails";
import { useProjectById } from "~/features/projects/hooks/useProjects";

export default function ProjectDetailsPage({ projectId = "" }) {
  const project = useProjectById(projectId);
  const { name } = project.data ?? {};

  return (
    <LayoutWithSidebar
      sidebar="left"
      title={name}
      showBallot
      eligibilityCheck
      showInfo
    >
      <ProjectDetails attestation={project.data} projectId={projectId} />
    </LayoutWithSidebar>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  query: { projectId },
}) => ({ props: { projectId } });
