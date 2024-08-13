import { Heading } from "~/components/ui/Heading";
import ApproveVoters from "~/features/voters/components/ApproveVoters";
import { VotersList } from "~/features/voters/components/VotersList";
import { AdminLayout } from "~/layouts/AdminLayout";

const VotersPage = (): JSX.Element => (
  <AdminLayout title="Manage voters">
    <div className="flex w-full flex-col items-center">
      <div className="mb-8 flex w-1/2 items-center justify-between">
        <Heading as="h1" size="3xl">
          Approved voters
        </Heading>

        <ApproveVoters />
      </div>

      <div className="w-1/2">
        <VotersList />
      </div>
    </div>
  </AdminLayout>
);

export default VotersPage;
