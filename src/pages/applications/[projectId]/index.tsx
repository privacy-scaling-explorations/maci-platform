import { type GetServerSideProps } from "next";

import ApproveButton from "~/features/applications/components/ApproveButton";
import ProjectDetails from "~/features/projects/components/ProjectDetails";
import { useProjectById } from "~/features/projects/hooks/useProjects";
import { Layout } from "~/layouts/DefaultLayout";

export interface IApplicationDetailsPageProps {
  projectId?: string;
}

const ApplicationDetailsPage = ({ projectId = "" }: IApplicationDetailsPageProps): JSX.Element => {
  const projects = useProjectById(projectId);

  return (
    <Layout title={projects.data?.[0]?.name}>
      <ProjectDetails action={<ApproveButton projectIds={[projectId]} />} attestation={projects.data?.[0]} />
    </Layout>
  );
};

export default ApplicationDetailsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { projectId } }) =>
  Promise.resolve({ props: { projectId } });
