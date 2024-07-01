import { type GetServerSideProps } from "next";
import { useMemo } from "react";

import { ReviewBar } from "~/features/applications/components/ReviewBar";
import { useApprovedApplications } from "~/features/applications/hooks/useApprovedApplications";
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
  const approved = useApprovedApplications();
  const { name } = projects.data?.[0] ?? {};
  const appState = useAppState();

  const approvedById = useMemo(
    () => new Map(approved.data?.map(({ refUID }) => [refUID, true]) ?? []),
    [approved.data],
  );

  const disabled = useMemo(() => approvedById.get(projectId), [approvedById, projectId]);

  return (
    <LayoutWithSidebar eligibilityCheck showBallot showInfo sidebar="left" title={name}>
      {appState === EAppState.APPLICATION && <ReviewBar projectId={projectId} />}

      <ProjectDetails attestation={projects.data?.[0]} disabled={!disabled} projectId={projectId} />
    </LayoutWithSidebar>
  );
};

export default ProjectDetailsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { projectId } }) =>
  Promise.resolve({
    props: { projectId },
  });
