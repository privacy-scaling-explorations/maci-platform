import clsx from "clsx";
import Link from "next/link";
import { useCallback, useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { Form } from "~/components/ui/Form";
import { Heading } from "~/components/ui/Heading";
import { Notice } from "~/components/ui/Notice";
import { useBallot } from "~/contexts/Ballot";
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
  pollId: string;
}

const ClearBallot = ({ pollId }: IClearBallotProps): JSX.Element | null => {
  const form = useFormContext();
  const [isOpen, setOpen] = useState(false);
  const { deleteBallot } = useBallot();

  const handleOpenDialog = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  if ([ERoundState.TALLYING, ERoundState.RESULTS].includes(useRoundState({ pollId }))) {
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
        className="mt-4 cursor-pointer text-gray-400 underline hover:text-black"
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
  pollId: string;
}

const EmptyBallot = ({ pollId }: IEmptyBallotProps): JSX.Element => (
  <div className="flex flex-1 items-center justify-center">
    <div className=" max-w-[360px] space-y-4">
      <Heading className="text-center" size="lg">
        Your ballot is empty
      </Heading>

      <p className="text-center text-sm text-gray-700">
        There are currently no projects added. Browse through the available projects.
      </p>

      <div className="flex items-center justify-center gap-3">
        <Button as={Link} href={`/rounds/${pollId}`} size="auto" variant="primary">
          View projects
        </Button>
      </div>
    </div>
  </div>
);

interface IBallotAllocationFormProps {
  pollId: string;
  mode: string;
}

const BallotAllocationForm = ({ pollId, mode }: IBallotAllocationFormProps): JSX.Element => {
  const roundState = useRoundState({ pollId });
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

      {mode.toString() === "0" && (
        <Notice
          italic
          content="This round uses Quadratic Voting to encourage supporting diverse projects. The cost to vote = (number of votes)². Therefore we encourage to distribute your votes across more projects to maximize your impact."
          variant="note"
        />
      )}

      {ballot.published && (
        <Link className="text-blue-400 hover:underline" href={`/rounds/${pollId}/ballot/confirmation`}>
          Check your submitted ballot
        </Link>
      )}

      <div className="mb-4 justify-end sm:flex">{ballot.votes.length ? <ClearBallot pollId={pollId} /> : null}</div>

      <div className="border-t border-gray-300">
        <div className="px-0 sm:p-8">
          {ballot.votes.length ? (
            <AllocationFormWrapper projectIsLink disabled={roundState === ERoundState.RESULTS} pollId={pollId} />
          ) : (
            <EmptyBallot pollId={pollId} />
          )}
        </div>

        <div className={clsx("flex h-16 items-center justify-end gap-2", sum > initialVoiceCredits && "text-red")}>
          <h4>Total votes:</h4>

          <p className="dark:text-white">{formatNumber(sum)}</p>
        </div>
      </div>
    </div>
  );
};

interface IBallotPageProps {
  pollId: string;
}

const BallotPage = ({ pollId }: IBallotPageProps): JSX.Element => {
  const { getBallot, sumBallot } = useBallot();
  const { getRoundByPollId } = useRound();
  const { isRegistered } = useMaci();
  const roundState = useRoundState({ pollId });

  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);
  const ballot = useMemo(() => getBallot(pollId), [round?.pollId, getBallot]);

  const handleSubmit = useCallback(() => {
    sumBallot();
  }, [sumBallot]);

  return (
    <LayoutWithSidebar requireAuth showBallot showSubmitButton pollId={pollId} sidebar="right">
      {roundState === ERoundState.VOTING && isRegistered && (
        <Form defaultValues={ballot} schema={BallotSchema} values={ballot} onSubmit={handleSubmit}>
          <BallotAllocationForm mode={round!.mode} pollId={pollId} />
        </Form>
      )}

      {roundState !== ERoundState.VOTING && (
        <div className="dark:text-white">You can only vote during the voting period.</div>
      )}

      {!isRegistered && (
        <div className="dark:text-white">You must sign up to access the full information on this page.</div>
      )}
    </LayoutWithSidebar>
  );
};

export default BallotPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { pollId } }) =>
  Promise.resolve({
    props: { pollId },
  });
