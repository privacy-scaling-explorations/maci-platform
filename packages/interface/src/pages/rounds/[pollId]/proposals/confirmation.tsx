import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { zeroAddress } from "viem";

import { EmptyState } from "~/components/EmptyState";
import { Alert } from "~/components/ui/Alert";
import { Heading } from "~/components/ui/Heading";
import { useRound } from "~/contexts/Round";
import { ProjectItem } from "~/features/projects/components/ProjectItem";
import { useRequestByIndex } from "~/hooks/useRequests";
import { Layout } from "~/layouts/DefaultLayout";
import { useRoundState } from "~/utils/state";
import { ERoundState, type IRecipient } from "~/utils/types";

import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ query: { pollId } }) =>
  Promise.resolve({
    props: { pollId },
  });

const ConfirmProposalPage = ({ pollId }: { pollId: string }): JSX.Element => {
  const state = useRoundState({ pollId });

  const { getRoundByPollId } = useRound();

  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);

  const searchParams = useSearchParams();

  const requestIndex = useMemo(() => searchParams.get("index"), [searchParams]);
  const proposal = useRequestByIndex(round?.registryAddress ?? zeroAddress, requestIndex ?? "");

  const project = useMemo(() => proposal.data, [proposal]);

  if (proposal.isLoading) {
    return <EmptyState title="Loading your proposal..." />;
  }

  if (project === undefined) {
    return (
      <Layout pollId={pollId}>
        <div className="flex w-full justify-center">
          <div className="flex flex-col items-center gap-4 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg">
            <Heading as="h2" size="4xl">
              There is no such proposal for this round!
            </Heading>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pollId={pollId}>
      <div className="flex w-fit justify-center sm:w-full">
        <div className="flex flex-col items-center gap-4 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg">
          <div>
            <Heading as="h2" size="4xl">
              Your project proposal has been submitted!
            </Heading>

            <p className="text-gray-400">
              Thank you for submitting your project proposal. Our team is now reviewing it.
            </p>

            <p className="flex gap-1 text-blue-400">
              <FiAlertCircle className="h-4 w-4" />

              <i className="text-sm">Proposal can be approved until the Application period ends.</i>
            </p>

            {state !== ERoundState.APPLICATION && <Alert title="Application period has ended" variant="info" />}
          </div>

          <ProjectItem isLoading={false} pollId={pollId} recipient={project.recipient as IRecipient} />
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmProposalPage;
