import { ApplicationsToApprove } from "~/features/applications/components/ApplicationsToApprove";
import { AdminLayout } from "~/layouts/AdminLayout";

import type { GetServerSideProps } from "next";

interface IApplicationsPageProps {
  roundId: string;
}

const ApplicationsPage = ({ roundId }: IApplicationsPageProps): JSX.Element => (
  <AdminLayout roundId={roundId} title="Review applications">
    <ApplicationsToApprove roundId={roundId} />
  </AdminLayout>
);

export default ApplicationsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { roundId } }) =>
  Promise.resolve({
    props: { roundId },
  });
