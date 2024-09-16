import { useMaci } from "~/contexts/Maci";
import { ApplicationsToApprove } from "~/features/applications/components/ApplicationsToApprove";
import { AdminLayout } from "~/layouts/AdminLayout";

const ApplicationsPage = (): JSX.Element => {
  // get poll data
  const { pollData } = useMaci();


  if (!pollData) {
    return <div>Loading...</div>;
  }


  return (
    <AdminLayout title="Review applications">
      <ApplicationsToApprove registryAddress={pollData.registry} />
    </AdminLayout>
  );
}

export default ApplicationsPage;
