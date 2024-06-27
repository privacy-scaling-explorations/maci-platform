import { type GetServerSideProps } from "next";

import ProjectDetails from "~/features/projects/components/ProjectDetails";
import { useProjectById } from "~/features/projects/hooks/useProjects";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";

export interface IProjectDetailsProps {
  projectId?: string;
}

const ProjectDetailsPage = ({ projectId = "" }: IProjectDetailsProps): JSX.Element => {
  const projects = useProjectById(projectId);
  const { name } = projects.data?.[0] ?? {};

  return (
    <LayoutWithSidebar eligibilityCheck showBallot showInfo sidebar="left" title={name}>
      <ProjectDetails attestation={projects.data?.[0]} projectId={projectId} />
    </LayoutWithSidebar>
  );
};

export default ProjectDetailsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { projectId } }) =>
  Promise.resolve({
    props: { projectId },
  });
