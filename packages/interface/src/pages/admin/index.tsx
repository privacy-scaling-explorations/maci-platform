import { useRound } from "~/contexts/Round";
import { DeployContracts } from "~/features/admin/components/DeployContracts";
import { DeployRounds } from "~/features/admin/components/DeployRounds";
import { Layout } from "~/layouts/DefaultLayout";

const AdminPage = (): JSX.Element => {
  const { isContractsDeployed } = useRound();

  return (
    <Layout requireAuth>
      <div className="flex flex-col items-center">
        <div className="w-5/6">{isContractsDeployed ? <DeployRounds /> : <DeployContracts />}</div>
      </div>
    </Layout>
  );
};

export default AdminPage;
