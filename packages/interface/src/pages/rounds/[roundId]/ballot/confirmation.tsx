import { useRouter } from "next/router";
import { useEffect, useState, useCallback, useMemo } from "react";

import { Spinner } from "~/components/ui/Spinner";
import { defaultBallot, useBallot } from "~/contexts/Ballot";
import { useRound } from "~/contexts/Round";
import { BallotConfirmation } from "~/features/ballot/components/BallotConfirmation";
import { Layout } from "~/layouts/DefaultLayout";

import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ query: { roundId } }) =>
  Promise.resolve({
    props: { roundId },
  });

const BallotConfirmationPage = ({ roundId }: { roundId: string }): JSX.Element | null => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { getRoundByRoundId } = useRound();
  const { getBallot, isLoading: isBallotLoading } = useBallot();

  const round = useMemo(() => getRoundByRoundId(roundId), [roundId, getRoundByRoundId]);
  const ballot = useMemo(() => {
    if (round?.pollId) {
      return getBallot(round.pollId);
    }
    return defaultBallot;
  }, [round?.pollId, getBallot]);

  const router = useRouter();

  const manageDisplay = useCallback(() => {
    if (isBallotLoading) {
      return;
    }

    if (ballot.published) {
      setIsLoading(false);
    } else {
      router.push(`/rounds/${roundId}/ballot`);
    }
  }, [router, ballot, isBallotLoading, roundId]);

  useEffect(() => {
    manageDisplay();
  }, [manageDisplay]);

  return (
    <Layout requireAuth>
      {isLoading ? <Spinner className="h-6 w-6" /> : <BallotConfirmation roundId={roundId} />}
    </Layout>
  );
};

export default BallotConfirmationPage;
