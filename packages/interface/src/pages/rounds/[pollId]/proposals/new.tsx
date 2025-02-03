import { FiAlertCircle } from "react-icons/fi";

import { Alert } from "~/components/ui/Alert";
import { Heading } from "~/components/ui/Heading";
import { MetadataForm } from "~/features/proposals/components/MetadataForm";
import { Layout } from "~/layouts/DefaultLayout";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ query: { pollId } }) =>
  Promise.resolve({
    props: { pollId },
  });

const NewProposalPage = ({ pollId }: { pollId: string }): JSX.Element => {
  const state = useRoundState({ pollId });

  return (
    <Layout pollId={pollId}>
      <div className="flex w-full justify-center">
        <div className="flex flex-col gap-4 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg">
          <Heading as="h3" size="3xl">
            New Proposal
          </Heading>

          <p className="text-gray-400">
            <span className="inline-block">
              Fill out this form to create a proposal for your project. It will then be reviewed by our admins.
            </span>

            <span className="inline-block">
              Your progress is saved locally so you can return to this page to resume your proposal.
            </span>
          </p>

          <p className="flex gap-1 text-blue-400">
            <FiAlertCircle className="h-4 w-4" />

            <i className="text-sm">Proposals can be approved until the Application period ends.</i>
          </p>

          {state !== ERoundState.APPLICATION ? (
            <Alert title="Application period has ended" variant="info" />
          ) : (
            <MetadataForm pollId={pollId} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NewProposalPage;
