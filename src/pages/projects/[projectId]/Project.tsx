import { type GetServerSideProps } from "next";

import { ProjectAddToBallot } from "~/features/projects/components/AddToBallot";
import { ProjectAwarded } from "~/features/projects/components/ProjectAwarded";
import ProjectDetails from "~/features/projects/components/ProjectDetails";
import { useProjectById } from "~/features/projects/hooks/useProjects";
import { LayoutWithBallot } from "~/layouts/DefaultLayout";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

export interface IProjectDetailsProps {
  projectId?: string;
}

const ProjectDetailsPage = ({ projectId = "" }: IProjectDetailsProps): JSX.Element => {
  const projects = useProjectById(projectId);
  const { name } = projects.data?.[0] ?? {};
  const appState = useAppState();

  const action =
    appState === EAppState.RESULTS ? (
      <ProjectAwarded id={projectId} />
    ) : (
      <ProjectAddToBallot id={projectId} name={name} />
    );
  return (
    <LayoutWithBallot eligibilityCheck showBallot sidebar="left" title={name}>
      <ProjectDetails action={action} attestation={projects.data?.[0]} />
    </LayoutWithBallot>
  );
};

export default ProjectDetailsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { projectId } }) =>
  Promise.resolve({
    props: { projectId },
  });
