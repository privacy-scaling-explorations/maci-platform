import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { zeroAddress } from "viem";

import { EmptyState } from "~/components/EmptyState";
import { Alert } from "~/components/ui/Alert";
import { Heading } from "~/components/ui/Heading";
import { useRound } from "~/contexts/Round";
import { useApplicationById } from "~/features/applications/hooks/useApplicationById";
import { ProjectItem } from "~/features/projects/components/ProjectItem";
import { Layout } from "~/layouts/DefaultLayout";
import { useRoundState } from "~/utils/state";
import { ERoundState, type IRecipient } from "~/utils/types";

import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ query: { roundId } }) =>
  Promise.resolve({
    props: { roundId },
  });

const ConfirmProjectPage = ({ roundId }: { roundId: string }): JSX.Element => {
  const state = useRoundState(roundId);

  const { getRoundByRoundId } = useRound();

  const round = useMemo(() => getRoundByRoundId(roundId), [roundId, getRoundByRoundId]);

  const searchParams = useSearchParams();

  const applicationId = useMemo(() => searchParams.get("id"), [searchParams]);
  const application = useApplicationById(round?.registryAddress ?? zeroAddress, applicationId ?? "");

  const project = useMemo(() => application.data, [application]);

  if (application.isLoading) {
    return <EmptyState title="Loading application..." />;
  }

  if (project === undefined) {
    return (
      <Layout>
        <div className="flex w-full justify-center">
          <div className="flex flex-col items-center gap-4 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg">
            <Heading as="h2" size="4xl">
              There is no such application for this round!
            </Heading>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex w-fit justify-center sm:w-full">
        <div className="flex flex-col items-center gap-4 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg">
          {project.recipient.initialized === false ? (
            <div>
              <Heading as="h2" size="4xl">
                Your project application has been submitted!
              </Heading>

              <p className="text-gray-400">
                Thank you for submitting your project application. Our team is now reviewing it.
              </p>

              <p className="flex gap-1 text-blue-400">
                <FiAlertCircle className="h-4 w-4" />

                <i className="text-sm">Applications can be edited and approved until the Application period ends.</i>
              </p>

              {state !== ERoundState.APPLICATION && <Alert title="Application period has ended" variant="info" />}
            </div>
          ) : (
            <div>
              <Heading as="h2" size="4xl">
                Your project application has been approved!
              </Heading>
            </div>
          )}

          <Link href={`/rounds/${roundId}/${project.recipient.id}`}>
            <ProjectItem isLoading={false} recipient={project.recipient as IRecipient} roundId={roundId} />
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmProjectPage;
