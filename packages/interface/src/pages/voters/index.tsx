import { useWalletClient } from "wagmi";

import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import ApproveVoters from "~/features/voters/components/ApproveVoters";
import { VotersList } from "~/features/voters/components/VotersList";
import { AdminLayout } from "~/layouts/AdminLayout";
import { getSmartAccount } from "~/utils/accountAbstraction";

const VotersPage = (): JSX.Element => {
  const client = useWalletClient();

  const createWallet = async () => {
    const smartAccount = await getSmartAccount(client);
  };

  return (
    <AdminLayout title="Manage voters">
      <div className="flex w-full flex-col items-center">
        <div className="mb-8 flex w-1/2 items-center justify-between">
          <Heading as="h1" size="3xl">
            Approved voters
          </Heading>

          <ApproveVoters />
        </div>

        <Button variant="secondary" onClick={createWallet}>
          Create Wallet
        </Button>

        <div className="w-1/2">
          <VotersList />
        </div>
      </div>
    </AdminLayout>
  );
};

export default VotersPage;
