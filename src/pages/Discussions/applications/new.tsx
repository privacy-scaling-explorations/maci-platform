import { useAccount } from "wagmi";

import { Alert } from "~/components/ui/Alert";
import { Markdown } from "~/components/ui/Markdown";
import { ApplicationForm } from "~/features/applications/components/ApplicationForm";
import { Layout } from "~/layouts/DefaultLayout";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

const APPLICATION_TEXT = `
Fill out this form to create a proposal for discusion {enter discussion name}.
Your progress is saved locally so you can return to this page to resume your proposal.
`;

const NewProjectPage = (): JSX.Element => {
  const { address } = useAccount();
  const state = useAppState();

  return (
    <Layout>
      <h1 className="text-5xl text-[#222133]"> New Proposal</h1>

      <Markdown className="mb-8 text-[#222133]">{APPLICATION_TEXT}</Markdown>

      {state !== EAppState.APPLICATION ? (
        <Alert title="Application period has ended" variant="info" />
      ) : (
        <ApplicationForm address={address} />
      )}
    </Layout>
  );
};

export default NewProjectPage;
