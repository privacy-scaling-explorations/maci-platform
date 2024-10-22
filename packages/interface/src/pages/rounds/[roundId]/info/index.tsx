import { format } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import { useAccount } from "wagmi";

import { ConnectButton } from "~/components/ConnectButton";
import { EligibilityDialog } from "~/components/EligibilityDialog";
import { Info } from "~/components/Info";
import { JoinButton } from "~/components/JoinButton";
import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";
import { Layout } from "~/layouts/DefaultLayout";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { GetServerSideProps } from "next";

const InfoPage = ({ roundId }: { roundId: string }): JSX.Element => {
  const { isConnected } = useAccount();
  const { isRegistered } = useMaci();

  const { getRoundByRoundId } = useRound();
  const round = useMemo(() => getRoundByRoundId(roundId), [roundId, getRoundByRoundId]);

  const roundState = useRoundState(roundId);

  return (
    <Layout roundId={roundId} type="home">
      <EligibilityDialog />

      <div className="flex h-[90vh] w-screen flex-col items-center justify-center gap-4 bg-blue-50 dark:bg-black">
        <Heading className="max-w-screen-lg text-center" size="6xl">
          {config.eventName}
        </Heading>

        <Heading as="h2" className="max-w-screen-lg text-center" size="4xl">
          {roundId.toUpperCase()}
        </Heading>

        <p className="flex max-w-screen-md gap-2 text-center text-xl dark:text-gray-400">
          <span>{round?.startsAt && format(round.startsAt, "d MMMM, yyyy")}</span>

          <span>-</span>

          <span>{round?.votingEndsAt && format(round.votingEndsAt, "d MMMM, yyyy")}</span>
        </p>

        {!isConnected && <ConnectButton />}

        {isConnected && roundState === ERoundState.APPLICATION && (
          <Button size="auto" variant="primary">
            <Link href={`/rounds/${roundId}/applications/new`}>Start Application</Link>
          </Button>
        )}

        {isConnected && isRegistered && roundState === ERoundState.VOTING && (
          <Button size="auto" variant="primary">
            <Link href={`/rounds/${roundId}/projects`}>View projects</Link>
          </Button>
        )}

        {isConnected && !isRegistered && <JoinButton />}

        <div className="my-8">
          <Info showAppState roundId={roundId} size="default" />
        </div>
      </div>
    </Layout>
  );
};

export default InfoPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { roundId } }) =>
  Promise.resolve({
    props: { roundId },
  });
