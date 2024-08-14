import { ReviewBar } from "~/features/applications/components/ReviewBar";
import ProjectDetails from "~/features/projects/components/ProjectDetails";
import { useProjectById } from "~/features/projects/hooks/useProjects";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { GetServerSideProps } from "next";

export interface IProjectDetailsProps {
  roundId: string;
  projectId?: string;
}

const ProjectDetailsPage = ({ roundId, projectId = "" }: IProjectDetailsProps): JSX.Element => {
  const projects = useProjectById(projectId);
  const { name } = projects.data?.[0] ?? {};
  const appState = useRoundState(roundId);

  return (
    <LayoutWithSidebar eligibilityCheck showBallot showInfo sidebar="left" title={name}>
      {appState === ERoundState.APPLICATION && <ReviewBar projectId={projectId} roundId={roundId} />}

      <ProjectDetails attestation={projects.data?.[0]} projectId={projectId} roundId={roundId} />
    </LayoutWithSidebar>
  );
};

export default ProjectDetailsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { projectId, roundId } }) =>
  Promise.resolve({
    props: { projectId, roundId },
  });
