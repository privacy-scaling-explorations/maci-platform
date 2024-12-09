import { ApplicationsToApprove } from "~/features/applications/components/ApplicationsToApprove";
import { AdminLayout } from "~/layouts/AdminLayout";

import type { GetServerSideProps } from "next";

interface IApplicationsPageProps {
  pollId: string;
}

const ApplicationsPage = ({ pollId }: IApplicationsPageProps): JSX.Element => (
  <AdminLayout pollId={pollId} title="Review applications">
    <ApplicationsToApprove pollId={pollId} />
  </AdminLayout>
);

export default ApplicationsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { pollId } }) =>
  Promise.resolve({
    props: { pollId },
  });
