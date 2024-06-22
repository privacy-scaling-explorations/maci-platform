import { useAccount } from "wagmi";

import { Alert } from "~/components/ui/Alert";
import { Markdown } from "~/components/ui/Markdown";
import { ApplicationForm } from "~/features/applications/components/ApplicationForm";
import { Layout } from "~/layouts/DefaultLayout";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

const APPLICATION_TEXT = `
### New Application
Fill out this form to create an application for your project. It will
then be reviewed by our admins. 

Your progress is saved locally so you can return to this page to resume your application.
`;

const NewProjectPage = (): JSX.Element => {
  const { address } = useAccount();
  const state = useAppState();

  return (
    <Layout>
      <Markdown className="mb-8">{APPLICATION_TEXT}</Markdown>

      {state !== EAppState.APPLICATION ? (
        <Alert title="Application period has ended" variant="info" />
      ) : (
        <ApplicationForm address={address} />
      )}
    </Layout>
  );
};

export default NewProjectPage;
