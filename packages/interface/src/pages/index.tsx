import { useMemo } from "react";
import { useAccount } from "wagmi";

import ConnectButton from "~/components/ConnectButton";
import { JoinButton } from "~/components/JoinButton";
import { SingleRoundHome } from "~/components/SingleRoundHome";
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
  const singleRound = useMemo(() => (rounds && rounds.length === 1 ? rounds[0] : undefined), [rounds]);

  return (
    <Layout pollId={singleRound ? singleRound.pollId : ""} type="home">
      {singleRound && <SingleRoundHome round={singleRound} />}

      {!singleRound && (
        <div className="flex h-auto w-screen flex-col items-center justify-center gap-4 bg-blue-50 px-2 pb-4 sm:min-h-[90vh] dark:bg-black">
          <Heading className="mt-4 max-w-screen-lg text-center sm:mt-8" size="6xl">
            {config.eventName}
          </Heading>

          <Heading className="max-w-screen-lg text-center" size="3xl">
            {config.eventDescription}
          </Heading>

          {!isConnected && <p className="text-gray-400">Connect your wallet to get started.</p>}

          <ConnectButton showMobile />

          {isConnected && !isRegistered && <JoinButton />}

          {isConnected && isAdmin && (
            <div className="flex flex-col gap-4">
              <p className="text-center text-gray-400">Configure and deploy your contracts to get started.</p>

              <Button size="auto" variant="primary">
                <a href="/coordinator">Get Started</a>
              </Button>
            </div>
          )}

          {isConnected && !isAdmin && rounds && rounds.length === 0 && (
            <p className="text-gray-400">There are no rounds deployed.</p>
          )}

          {rounds && rounds.length > 1 && <RoundsList />}
        </div>
      )}

      <FAQList />
    </Layout>
  );
};

export default HomePage;
