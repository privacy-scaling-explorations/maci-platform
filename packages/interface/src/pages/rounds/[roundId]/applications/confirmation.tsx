import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FiAlertCircle } from "react-icons/fi";

import { Alert } from "~/components/ui/Alert";
import { Heading } from "~/components/ui/Heading";
import { useApplicationByTxHash } from "~/features/applications/hooks/useApplicationByTxHash";
import { ProjectItem } from "~/features/projects/components/ProjectItem";
import { Layout } from "~/layouts/DefaultLayout";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

interface IConfirmProjectPageProps {
  roundId: string;
}

const ConfirmProjectPage = ({ roundId }: IConfirmProjectPageProps): JSX.Element => {
  const state = useRoundState(roundId);

  const searchParams = useSearchParams();
  const txHash = useMemo(() => searchParams.get("txHash"), [searchParams]);
  const project = useApplicationByTxHash(txHash ?? "");

  const attestation = useMemo(() => project.data, [project]);

  return (
    <Layout>
      <div className="flex w-fit justify-center sm:w-full">
        <div className="flex flex-col items-center gap-4 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg">
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

          {attestation && (
            <Link href={`/projects/${attestation.id}`}>
              <ProjectItem attestation={attestation} isLoading={false} roundId={roundId} />
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmProjectPage;
