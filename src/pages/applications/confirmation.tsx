import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FiAlertCircle } from "react-icons/fi";

import { Alert } from "~/components/ui/Alert";
import { useApplicationByTxHash } from "~/features/applications/hooks/useApplicationByTxHash";
import { ProjectItem } from "~/features/projects/components/ProjectItem";
import { Layout } from "~/layouts/DefaultLayout";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

const ConfirmProjectPage = (): JSX.Element => {
  const state = useAppState();

  const searchParams = useSearchParams();
  const txHash = searchParams.get("txHash");
  const project = useApplicationByTxHash(txHash ?? "");

  const attestation = useMemo(() => project.data, [project]);

  return (
    <Layout>
      <div className="flex w-full justify-center">
        <div className="flex flex-col items-center gap-4 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg">
          <h2 className="font-mono uppercase">Your project application has been submitted!</h2>

          <p className="text-gray-400">
            Thank you for submitting your project application. Our team is now reviewing it.
          </p>

          <p className="flex gap-1 text-blue-400">
            <FiAlertCircle className="h-4 w-4" />

            <i className="text-sm">Applications can be edited and approved until the Registration period ends.</i>
          </p>

          {state !== EAppState.APPLICATION && <Alert title="Application period has ended" variant="info" />}

          {attestation && (
            <Link href={`/projects/${attestation.id}`}>
              <ProjectItem attestation={attestation} isLoading={false} />
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmProjectPage;
