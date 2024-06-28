import { format } from "date-fns";
import Link from "next/link";
import { useAccount } from "wagmi";

import { ConnectButton } from "~/components/ConnectButton";
import { EligibilityDialog } from "~/components/EligibilityDialog";
import { Info } from "~/components/Info";
import { JoinButton } from "~/components/JoinButton";
import { Button } from "~/components/ui/Button";
import { config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { FAQList } from "~/features/signup/components/FaqList";
import { Layout } from "~/layouts/DefaultLayout";

const SignupPage = (): JSX.Element => {
  const { isConnected } = useAccount();
  const { isRegistered } = useMaci();

  return (
    <Layout type="home">
      <EligibilityDialog />

      <div className="flex h-[90vh] w-screen flex-col items-center justify-center gap-4 bg-blue-50">
        <h1 className="max-w-screen-lg text-center font-mono">{config.eventName.toUpperCase()}</h1>

        <h2 className="max-w-screen-lg text-center font-mono">{config.roundId.toUpperCase()}</h2>

        <p className="flex max-w-screen-md gap-2 text-center text-xl">
          <span>{format(config.startsAt, "d MMMM, yyyy")}</span>

          <span>-</span>

          <span>{format(config.resultsAt, "d MMMM, yyyy")}</span>
        </p>

        {isConnected && isRegistered && (
          <Button size="auto" variant="primary">
            <Link href="/projects">View projects</Link>
          </Button>
        )}

        {isConnected && !isRegistered && <JoinButton />}

        {!isConnected && <ConnectButton />}

        <div className="my-8">
          <Info size="default" />
        </div>
      </div>

      <FAQList />
    </Layout>
  );
};

export default SignupPage;
