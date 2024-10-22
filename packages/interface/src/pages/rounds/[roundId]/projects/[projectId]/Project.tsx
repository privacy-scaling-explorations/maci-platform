import { useMemo } from "react";
import { zeroAddress } from "viem";

import { useRound } from "~/contexts/Round";
import { ReviewBar } from "~/features/applications/components/ReviewBar";
import ProjectDetails from "~/features/projects/components/ProjectDetails";
import { useProjectById } from "~/features/projects/hooks/useProjects";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import { useRoundState } from "~/utils/state";
import { ERoundState, IRecipient } from "~/utils/types";

import type { GetServerSideProps } from "next";

export interface IProjectDetailsProps {
  roundId: string;
  projectId?: string;
}

const ProjectDetailsPage = ({ projectId = "", roundId }: IProjectDetailsProps): JSX.Element => {
  const { getRoundByRoundId } = useRound();

  const round = useMemo(() => getRoundByRoundId(roundId), [roundId, getRoundByRoundId]);

  const projects = useProjectById(projectId, round?.registryAddress ?? zeroAddress);

  const appState = useRoundState(roundId);

  return (
    <LayoutWithSidebar eligibilityCheck showBallot showInfo roundId={roundId} sidebar="left">
      {appState === ERoundState.APPLICATION && <ReviewBar projectId={projectId} roundId={roundId} />}

      {projects.data && <ProjectDetails project={projects.data as unknown as IRecipient} roundId={roundId} />}
    </LayoutWithSidebar>
  );
};

export default ProjectDetailsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { projectId, roundId } }) =>
  Promise.resolve({
    props: { projectId, roundId },
  });
