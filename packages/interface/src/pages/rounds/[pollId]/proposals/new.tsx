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
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <Heading as="h4" className="!font-normal !tracking-[0.4px] text-black" size="4xl">
              New Application
            </Heading>

            <p className="inline-block font-sans text-base font-normal leading-6 text-gray-400">
              Fill out this form to create a proposal for your project. It will then be reviewed by our admins. <br />
              Your progress is saved locally so you can return to this page to resume your proposal.
            </p>

            <div className="flex items-center gap-[6px]">
              <FiAlertCircle className="h-4 w-4 text-blue-400" />

              <span className="font-sans text-xs font-normal italic leading-[18px] text-blue-400">
                Proposals can be approved until the Application period ends.
              </span>
            </div>
          </div>

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
