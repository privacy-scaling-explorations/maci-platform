import { useMemo } from "react";

import { ReviewBar } from "~/features/applications/components/ReviewBar";
import { useApprovedApplications } from "~/features/applications/hooks/useApprovedApplications";
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
  const approved = useApprovedApplications(roundId);
  const { name } = projects.data?.[0] ?? {};
  const appState = useRoundState(roundId);

  const approvedById = useMemo(
    () => new Map(approved.data?.map(({ refUID }) => [refUID, true]) ?? []),
    [approved.data],
  );

  const disabled = useMemo(() => approvedById.get(projectId), [approvedById, projectId]);

  return (
    <LayoutWithSidebar eligibilityCheck showBallot showInfo sidebar="left" title={name}>
      {appState === ERoundState.APPLICATION && <ReviewBar projectId={projectId} roundId={roundId} />}

      <ProjectDetails attestation={projects.data?.[0]} disabled={!disabled} projectId={projectId} roundId={roundId} />
    </LayoutWithSidebar>
  );
};

export default ProjectDetailsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { projectId, roundId } }) =>
  Promise.resolve({
    props: { projectId, roundId },
  });
