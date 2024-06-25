import { type GetServerSideProps } from "next";

import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import ProjectDetails from "~/features/projects/components/ProjectDetails";
import { useProjectById } from "~/features/projects/hooks/useProjects";

export interface IProjectDetailsProps {
  projectId?: string;
}

const ProjectDetailsPage = ({ projectId = "" }: IProjectDetailsProps): JSX.Element => {
  const projects = useProjectById(projectId);
  const { name } = projects.data?.[0] ?? {};;

  return (
    <LayoutWithSidebar
      sidebar="left"
      title={name}
      showBallot
      eligibilityCheck
      showInfo
    >
      <ProjectDetails attestation={projects.data?.[0]} projectId={projectId} />
    </LayoutWithSidebar>
  );
};

export default ProjectDetailsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { projectId } }) =>
  Promise.resolve({
    props: { projectId },
  });
