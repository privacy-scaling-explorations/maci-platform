import { type GetServerSideProps } from "next";
import { zeroAddress } from "viem";

import { useMaci } from "~/contexts/Maci";
import { ReviewBar } from "~/features/applications/components/ReviewBar";
import ProjectDetails from "~/features/projects/components/ProjectDetails";
import { useProjectById } from "~/features/projects/hooks/useProjects";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import { useAppState } from "~/utils/state";
import { EAppState, IRecipient } from "~/utils/types";

export interface IProjectDetailsProps {
  projectId?: string;
}

const ProjectDetailsPage = ({ projectId = "" }: IProjectDetailsProps): JSX.Element => {
  const { pollData } = useMaci();

  const projects = useProjectById(projectId, pollData?.registry ?? zeroAddress);

  const appState = useAppState();

  return (
    <LayoutWithSidebar eligibilityCheck showBallot showInfo sidebar="left">
      {appState === EAppState.APPLICATION && <ReviewBar projectId={projectId} />}

      {projects.data && <ProjectDetails project={projects.data as unknown as IRecipient} />}
    </LayoutWithSidebar>
  );
};

export default ProjectDetailsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { projectId } }) =>
  Promise.resolve({
    props: { projectId },
  });
