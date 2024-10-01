import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { zeroAddress } from "viem";

import { Alert } from "~/components/ui/Alert";
import { Heading } from "~/components/ui/Heading";
import { useMaci } from "~/contexts/Maci";
import { useApplicationById } from "~/features/applications/hooks/useApplicationId";
import { ProjectItem } from "~/features/projects/components/ProjectItem";
import { Layout } from "~/layouts/DefaultLayout";
import { useAppState } from "~/utils/state";
import { EAppState, IRecipient } from "~/utils/types";

const ConfirmProjectPage = (): JSX.Element => {
  const state = useAppState();

  const { pollData } = useMaci();

  const searchParams = useSearchParams();
  const applicationId = useMemo(() => searchParams.get("id"), [searchParams]);
  const application = useApplicationById(pollData?.registry ?? zeroAddress, applicationId ?? "");

  const project = useMemo(() => application.data, [application]);

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
      <div className="flex w-full justify-center">
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

              {state !== EAppState.APPLICATION && <Alert title="Application period has ended" variant="info" />}
            </div>
          ) : (
            <div>
              <Heading as="h2" size="4xl">
                Your project application has been approved!
              </Heading>
            </div>
          )}

          <Link href={`/projects/${project.recipient.id}`}>
            <ProjectItem isLoading={false} recipient={project.recipient as IRecipient} />
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default ConfirmProjectPage;
