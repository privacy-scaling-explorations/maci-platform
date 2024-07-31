import { ApplicationsToApprove } from "~/features/applications/components/ApplicationsToApprove";
import { AdminLayout } from "~/layouts/AdminLayout";

const ApplicationsPage = (): JSX.Element => (
  <AdminLayout title="Review applications">
    <ApplicationsToApprove />
  </AdminLayout>
);

export default ApplicationsPage;
