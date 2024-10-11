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
  pollId: string;
  projectId?: string;
}

const ProjectDetailsPage = ({ projectId = "", pollId }: IProjectDetailsProps): JSX.Element => {
  const { getRoundByPollId } = useRound();

  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);

  const projects = useProjectById(projectId, round?.registryAddress ?? zeroAddress);

  const roundState = useRoundState({ pollId });

  return (
    <LayoutWithSidebar eligibilityCheck showBallot showInfo pollId={pollId} sidebar="left">
      {roundState === ERoundState.APPLICATION && <ReviewBar pollId={pollId} projectId={projectId} />}

      {projects.data && <ProjectDetails pollId={pollId} project={projects.data as unknown as IRecipient} />}
    </LayoutWithSidebar>
  );
};

export default ProjectDetailsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { projectId, pollId } }) =>
  Promise.resolve({
    props: { projectId, pollId },
  });
