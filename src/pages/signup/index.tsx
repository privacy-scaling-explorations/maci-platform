import { useAccount } from "wagmi";
import Link from "next/link";
import { format } from "date-fns";

import { Layout } from "~/layouts/DefaultLayout";
import { config } from "~/config";
import { ConnectButton } from "~/components/ConnectButton";
import { JoinButton } from "~/components/JoinButton";
import { Info } from "~/components/Info";
import { EligibilityDialog } from "~/components/EligibilityDialog";
import { useMaci } from "~/contexts/Maci";
import { Button } from "~/components/ui/Button";

const SignupPage = (): JSX.Element => {
  const { isConnected } = useAccount();
  const { isRegistered } = useMaci();

  return (
    <Layout>
      <EligibilityDialog />

      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="max-w-screen-lg text-center font-mono">
          {config.eventName.toUpperCase()}
        </h1>
        <h2 className="max-w-screen-lg text-center font-mono">
          {config.roundId.toUpperCase()}
        </h2>
        <p className="flex max-w-screen-md gap-2 text-center text-xl">
          <span>{format(config.startsAt, "d MMMM, yyyy")}</span>
          <span>-</span>
          <span>{format(config.resultsAt, "d MMMM, yyyy")}</span>
        </p>
        {isConnected && isRegistered && (
          <Button variant="primary" size="auto">
            <Link href="/projects">View projects</Link>
          </Button>
        )}
        {isConnected && !isRegistered && <JoinButton />}
        {!isConnected && <ConnectButton />}
        <div className="my-8">
          <Info size="default" />
        </div>
      </div>
    </Layout>
  );
}

export default SignupPage;
