import { useRouter } from "next/router";
import { useEffect, useState, useCallback, useMemo } from "react";

import { Spinner } from "~/components/ui/Spinner";
import { useBallot } from "~/contexts/Ballot";
import { BallotConfirmation } from "~/features/ballot/components/BallotConfirmation";
import { Layout } from "~/layouts/DefaultLayout";

import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ query: { pollId } }) =>
  Promise.resolve({
    props: { pollId },
  });

const BallotConfirmationPage = ({ pollId }: { pollId: string }): JSX.Element | null => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { getBallot, isLoading: isBallotLoading } = useBallot();

  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);

  const router = useRouter();

  const manageDisplay = useCallback(() => {
    if (isBallotLoading) {
      return;
    }

    if (ballot.published) {
      setIsLoading(false);
    } else {
      router.push(`/rounds/${pollId}/ballot`);
    }
  }, [router, ballot, isBallotLoading, pollId]);

  useEffect(() => {
    manageDisplay();
  }, [manageDisplay]);

  return (
    <Layout requireAuth pollId={pollId}>
      {isLoading ? <Spinner className="h-6 w-6" /> : <BallotConfirmation pollId={pollId} />}
    </Layout>
  );
};

export default BallotConfirmationPage;
