import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useAccount } from "wagmi";

import { Button } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { Form } from "~/components/ui/Form";
import { Heading } from "~/components/ui/Heading";
import { defaultBallot, useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";
import { AllocationFormWrapper } from "~/features/ballot/components/AllocationFormWrapper";
import { BallotSchema } from "~/features/ballot/types";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import { formatNumber } from "~/utils/formatNumber";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { GetServerSideProps } from "next";

interface IClearBallotProps {
  roundId: string;
  pollId: string;
}

const ClearBallot = ({ roundId, pollId }: IClearBallotProps): JSX.Element | null => {
  const form = useFormContext();
  const [isOpen, setOpen] = useState(false);
  const { deleteBallot } = useBallot();

  const handleOpenDialog = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  if ([ERoundState.TALLYING, ERoundState.RESULTS].includes(useRoundState(roundId))) {
    return null;
  }

  const handleClearBallot = () => {
    deleteBallot(pollId);
    setOpen(false);
    form.reset({ votes: [] });
  };

  return (
    <>
      <button
        className="cursor-pointer text-gray-400 underline hover:text-black"
        type="button"
        onClick={handleOpenDialog}
      >
        Remove all projects
      </button>

      <Dialog
        button="primary"
        buttonAction={handleClearBallot}
        buttonName="Yes, Clear my ballot"
        description="This will empty your ballot and remove all the projects you have added."
        isOpen={isOpen}
        size="sm"
        title="Are you sure?"
        onOpenChange={setOpen}
      />
    </>
  );
};

interface IEmptyBallotProps {
  roundId: string;
}

const EmptyBallot = ({ roundId }: IEmptyBallotProps): JSX.Element => (
  <div className="flex flex-1 items-center justify-center">
    <div className=" max-w-[360px] space-y-4">
      <Heading className="text-center" size="lg">
        Your ballot is empty
      </Heading>

      <p className="text-center text-sm text-gray-700">
        There are currently no projects added. Browse through the available projects.
      </p>

      <div className="flex items-center justify-center gap-3">
        <Button as={Link} href={`/rounds/${roundId}`} size="auto" variant="primary">
          View projects
        </Button>
      </div>
    </div>
  </div>
);

interface IBallotAllocationFormProps {
  roundId: string;
  pollId: string;
}

const BallotAllocationForm = ({ roundId, pollId }: IBallotAllocationFormProps): JSX.Element => {
  const roundState = useRoundState(roundId);
  const { getBallot, sumBallot } = useBallot();
  const { initialVoiceCredits } = useMaci();

  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);
  const sum = useMemo(() => sumBallot(ballot.votes), [ballot, sumBallot]);

  return (
    <div className="px-2 sm:px-8">
      <Heading className="tracking-tighter" size="4xl">
        My Ballot
      </Heading>

      <p className="my-4 text-gray-400">Once you have reviewed your vote allocation, you can submit your ballot.</p>

      {ballot.published && (
        <Link className="text-blue-400 hover:underline" href={`/rounds/${roundId}/ballot/confirmation`}>
          Check your submitted ballot
        </Link>
      )}

      <div className="mb-4 justify-end sm:flex">
        {ballot.votes.length ? <ClearBallot pollId={pollId} roundId={roundId} /> : null}
      </div>

      <div className="border-t border-gray-300">
        <div className="px-0 sm:p-8">
          {ballot.votes.length ? (
            <AllocationFormWrapper projectIsLink disabled={roundState === ERoundState.RESULTS} roundId={roundId} />
          ) : (
            <EmptyBallot roundId={roundId} />
          )}
        </div>

        <div className={clsx("flex h-16 items-center justify-end gap-2", sum > initialVoiceCredits && "text-red")}>
          <h4>Total votes:</h4>

          <p>{formatNumber(sum)}</p>
        </div>
      </div>
    </div>
  );
};

interface IBallotPageProps {
  roundId: string;
}

const BallotPage = ({ roundId }: IBallotPageProps): JSX.Element => {
  const { address, isConnecting } = useAccount();
  const { getBallot, sumBallot } = useBallot();
  const { getRoundByRoundId } = useRound();
  const router = useRouter();
  const roundState = useRoundState(roundId);

  const round = useMemo(() => getRoundByRoundId(roundId), [roundId, getRoundByRoundId]);
  const ballot = useMemo(() => {
    if (round?.pollId) {
      return getBallot(round.pollId);
    }
    return defaultBallot;
  }, [round?.pollId, getBallot]);

  useEffect(() => {
    if (!address && !isConnecting) {
      router.push("/");
    }
  }, [address, isConnecting, router]);

  const handleSubmit = useCallback(() => {
    sumBallot();
  }, [sumBallot]);

  return (
    <LayoutWithSidebar
      requireAuth
      requireRegistration
      showBallot
      showSubmitButton
      pollId={round?.pollId ?? ""}
      roundId={roundId}
      sidebar="right"
    >
      {roundState === ERoundState.VOTING && (
        <Form defaultValues={ballot} schema={BallotSchema} values={ballot} onSubmit={handleSubmit}>
          <BallotAllocationForm pollId={round?.pollId ?? ""} roundId={roundId} />
        </Form>
      )}

      {roundState !== ERoundState.VOTING && (
        <div className="dark:text-white">You can only vote during the voting period.</div>
      )}
    </LayoutWithSidebar>
  );
};

export default BallotPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { roundId } }) =>
  Promise.resolve({
    props: { roundId },
  });
