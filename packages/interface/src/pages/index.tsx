import clsx from "clsx";
import Image from "next/image";
import { useAccount } from "wagmi";

import { JoinButton } from "~/components/JoinButton";
import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";
import { FAQList } from "~/features/home/components/FaqList";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { Layout } from "~/layouts/DefaultLayout";

const HomePage = (): JSX.Element => {
  const { isConnected } = useAccount();
  const { isRegistered } = useMaci();
  const isAdmin = useIsAdmin();
  const { rounds } = useRound();

  return (
    <Layout type="home">
      <div className="flex h-auto w-screen flex-col items-center justify-center gap-4 bg-blue-50 px-2 sm:h-[90vh] dark:bg-black">
        <Heading className="mt-4 max-w-screen-lg text-center sm:mt-0" size="6xl">
          {config.eventName}
        </Heading>

        <Heading className="max-w-screen-lg text-center" size="3xl">
          {config.eventDescription}
        </Heading>

        {!isConnected && <p className="text-gray-400">Connect your wallet to get started.</p>}

        {isConnected && !isRegistered && <JoinButton />}

        {isConnected && !isAdmin && rounds && rounds.length === 0 && (
          <p className="text-gray-400">There are no rounds deployed.</p>
        )}

        {isConnected && isRegistered && (
          <Button className="mb-4 sm:mb-0" size="auto" variant="primary">
            <a href="/rounds/0">Go to Projects Page</a>
          </Button>
        )}

        <Image
          alt="arrow-down"
          className={clsx("absolute bottom-5 hidden sm:block dark:invert")}
          height="24"
          src="/arrow-down.svg"
          width="24"
        />
      </div>

      <FAQList />
    </Layout>
  );
};

export default HomePage;
