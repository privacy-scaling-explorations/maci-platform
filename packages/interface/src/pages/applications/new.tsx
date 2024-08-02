import { FiAlertCircle } from "react-icons/fi";

import { Alert } from "~/components/ui/Alert";
import { Heading } from "~/components/ui/Heading";
import { ApplicationForm } from "~/features/applications/components/ApplicationForm";
import { Layout } from "~/layouts/DefaultLayout";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

const NewProjectPage = (): JSX.Element => {
  const state = useAppState();

  return (
    <Layout>
      <div className="flex w-full justify-center">
        <div className="flex flex-col gap-4 md:max-w-screen-sm lg:max-w-screen-md xl:max-w-screen-lg">
          <Heading as="h3" size="3xl">
            New Application
          </Heading>

          <p className="text-gray-400">
            <span className="inline-block">
              Fill out this form to create an application for your project. It will then be reviewed by our admins.
            </span>

            <span className="inline-block">
              Your progress is saved locally so you can return to this page to resume your application.
            </span>
          </p>

          <p className="flex gap-1 text-blue-400">
            <FiAlertCircle className="h-4 w-4" />

            <i className="text-sm">Applications can be edited and approved until the Registration period ends.</i>
          </p>

          {state !== EAppState.APPLICATION ? (
            <Alert title="Application period has ended" variant="info" />
          ) : (
            <ApplicationForm />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NewProjectPage;
