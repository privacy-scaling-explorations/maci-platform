import { format } from "date-fns";
import Link from "next/link";
import { useAccount } from "wagmi";

import { ConnectButton } from "~/components/ConnectButton";
import { EligibilityDialog } from "~/components/EligibilityDialog";
import { Info } from "~/components/Info";
import { JoinButton } from "~/components/JoinButton";
import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { FAQList } from "~/features/signup/components/FaqList";
import { Layout } from "~/layouts/DefaultLayout";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

const SignupPage = (): JSX.Element => {
  const { isConnected } = useAccount();
  const { isRegistered } = useMaci();
  const appState = useAppState();

  return (
    <Layout type="home">
      <EligibilityDialog />

      <div className="flex h-[90vh] w-screen flex-col items-center justify-center gap-4 bg-blue-50 dark:bg-black">
        <Heading className="max-w-screen-lg text-center" size="6xl">
          {config.eventName}
        </Heading>

        <Heading as="h2" className="max-w-screen-lg text-center" size="4xl">
          {config.roundId.toUpperCase()}
        </Heading>

        <p className="flex max-w-screen-md gap-2 text-center text-xl dark:text-gray-400">
          <span>{config.startsAt && format(config.startsAt, "d MMMM, yyyy")}</span>

          <span>-</span>

          <span>{config.resultsAt && format(config.resultsAt, "d MMMM, yyyy")}</span>
        </p>

        {!isConnected && <ConnectButton />}

        {isConnected && appState === EAppState.APPLICATION && (
          <Button size="auto" variant="primary">
            <Link href="/applications/new">Start Application</Link>
          </Button>
        )}

        {isConnected && isRegistered && appState === EAppState.VOTING && (
          <Button size="auto" variant="primary">
            <Link href="/projects">View projects</Link>
          </Button>
        )}

        {isConnected && !isRegistered && <JoinButton />}

        <div className="my-8">
          <Info size="default" />
        </div>
      </div>

      <FAQList />
    </Layout>
  );
};

export default SignupPage;
