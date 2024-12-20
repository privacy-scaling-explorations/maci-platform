import { config } from "~/config";
import { Layout } from "~/layouts/DefaultLayout";

const CoordinatorPage = (): JSX.Element => (
  <Layout requireAuth>
    <div>
      <p>This is the coordinator page.</p>

      <p>You are using version with commit: {config.commitHash}</p>
    </div>
  </Layout>
);

export default CoordinatorPage;
