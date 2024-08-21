import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";

import { Spinner } from "~/components/ui/Spinner";
import { useBallot } from "~/contexts/Ballot";
import { BallotConfirmation } from "~/features/ballot/components/BallotConfirmation";
import { Layout } from "~/layouts/DefaultLayout";

interface IBallotConfirmationPageProps {
  roundId: string;
}

const BallotConfirmationPage = ({ roundId }: IBallotConfirmationPageProps): JSX.Element | null => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { ballot, isLoading: isBallotLoading } = useBallot();
  const router = useRouter();

  const manageDisplay = useCallback(() => {
    if (isBallotLoading) {
      return;
    }

    if (ballot.published) {
      setIsLoading(false);
    } else {
      router.push("/ballot");
    }
  }, [router, ballot, isBallotLoading]);

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
