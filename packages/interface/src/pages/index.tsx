import { useAccount } from "wagmi";

import { JoinButton } from "~/components/JoinButton";
import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";
import { FAQList } from "~/features/home/components/FaqList";
import { RoundsList } from "~/features/rounds/components/RoundsList";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { Layout } from "~/layouts/DefaultLayout";

const HomePage = (): JSX.Element => {
  const { isConnected } = useAccount();
  const { isRegistered } = useMaci();
  const isAdmin = useIsAdmin();
  const { rounds } = useRound();

  return (
    <Layout type="home">
      <div className="flex h-[90vh] w-screen flex-col items-center justify-center gap-4 bg-blue-50 dark:bg-black">
        <Heading className="max-w-screen-lg text-center" size="6xl">
          {config.eventName}
        </Heading>

        <Heading className="max-w-screen-lg text-center" size="3xl">
          {config.eventDescription}
        </Heading>

        {!isConnected && <p className="text-gray-400">Connect your wallet to get started.</p>}

        {isConnected && !isAdmin && !isRegistered && <JoinButton />}

        {isConnected && isAdmin && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-400">Configure and deploy your contracts to get started.</p>

            <Button size="auto" variant="primary">
              <a href="/coordinator">Get Started</a>
            </Button>
          </div>
        )}

        {isConnected && !isAdmin && rounds && rounds.length === 0 && (
          <p className="text-gray-400">There are no rounds deployed.</p>
        )}

        {rounds && rounds.length > 0 && <RoundsList />}
      </div>

      <FAQList />
    </Layout>
  );
};

export default HomePage;
