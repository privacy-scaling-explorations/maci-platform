import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";

import { useBallot } from "~/contexts/Ballot";
import { BallotConfirmation } from "~/features/ballot/components/BallotConfirmation";
import { Layout } from "~/layouts/DefaultLayout";
import { Spinner } from "~/components/ui/Spinner";

export default function BallotConfirmationPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { ballot, isLoading: isBallotLoading } = useBallot();
  const router = useRouter();

  const manageDisplay = useCallback(async () => {
    if (isBallotLoading) return;

    if (ballot.published) {
      setIsLoading(false);
    } else {
      await router.push("/ballot");
    }
  }, [router, ballot]);

  useEffect(() => {
    manageDisplay();
  }, [manageDisplay]);

  return (
    <Layout requireAuth>
      {isLoading ? <Spinner className="h-6 w-6" /> : <BallotConfirmation />}
    </Layout>
  );
}
