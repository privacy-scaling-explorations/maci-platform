import { type GetServerSideProps } from "next";

import { ReviewBar } from "~/features/applications/components/ReviewBar";
import ProjectDetails from "~/features/projects/components/ProjectDetails";
import { useProjectById } from "~/features/projects/hooks/useProjects";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

export interface IProjectDetailsProps {
  projectId?: string;
}

const ProjectDetailsPage = ({ projectId = "" }: IProjectDetailsProps): JSX.Element => {
  const projects = useProjectById(projectId);
  const { name } = projects.data?.[0] ?? {};
  const appState = useAppState();

  return (
    <LayoutWithSidebar eligibilityCheck showBallot showInfo sidebar="left" title={name}>
      {appState === EAppState.APPLICATION && <ReviewBar projectId={projectId} />}

      <ProjectDetails attestation={projects.data?.[0]} projectId={projectId} />
    </LayoutWithSidebar>
  );
};

export default ProjectDetailsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { projectId } }) =>
  Promise.resolve({
    props: { projectId },
  });
