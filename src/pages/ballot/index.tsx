import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useAccount } from "wagmi";

import { Button } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { Form } from "~/components/ui/Form";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { AllocationFormWrapper } from "~/features/ballot/components/AllocationList";
import { BallotSchema } from "~/features/ballot/types";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import { formatNumber } from "~/utils/formatNumber";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

const ClearBallot = (): JSX.Element | null => {
  const form = useFormContext();
  const [isOpen, setOpen] = useState(false);
  const { deleteBallot } = useBallot();

  const handleOpenDialog = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  if ([EAppState.TALLYING, EAppState.RESULTS].includes(useAppState())) {
    return null;
  }

  const handleClearBallot = () => {
    deleteBallot();
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

const EmptyBallot = (): JSX.Element => (
  <div className="flex flex-1 items-center justify-center">
    <div className=" max-w-[360px] space-y-4">
      <h3 className="text-center text-lg font-bold">Your vote is empty</h3>

      <p className="text-center text-sm text-gray-700">
        Your vote currently doesn&apos;t have any projects added. Browse through the available projects.
      </p>

      <div className="flex items-center justify-center gap-3">
        <Button as={Link} href="/projects" size="auto" variant="primary">
          View projects
        </Button>
      </div>
    </div>
  </div>
);

const BallotAllocationForm = (): JSX.Element => {
  const appState = useAppState();
  const { ballot, sumBallot } = useBallot();
  const { initialVoiceCredits } = useMaci();

  const sum = useMemo(() => sumBallot(ballot.votes), [ballot, sumBallot]);

  return (
    <div className="px-8">
      <h1 className="text-4xl uppercase tracking-tighter">My Ballot</h1>

      <p className="my-4 text-gray-400">Once you have reviewed your vote allocation, you can submit your ballot.</p>

      {ballot.published && (
        <Link className="text-blue-400 hover:underline" href="/ballot/confirmation">
          Check your submitted ballot
        </Link>
      )}

      <div className="mb-4 justify-end sm:flex">{ballot.votes.length ? <ClearBallot /> : null}</div>

      <div className="border-t border-gray-300">
        <div className="p-8">
          {ballot.votes.length ? (
            <AllocationFormWrapper projectIsLink disabled={appState === EAppState.RESULTS} />
          ) : (
            <EmptyBallot />
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

const BallotPage = (): JSX.Element => {
  const { address, isConnecting } = useAccount();
  const { ballot, sumBallot } = useBallot();
  const router = useRouter();
  const appState = useAppState();

  useEffect(() => {
    if (!address && !isConnecting) {
      router.push("/");
    }
  }, [address, isConnecting, router]);

  const handleSubmit = useCallback(() => {
    sumBallot();
  }, [sumBallot]);

  return (
    <LayoutWithSidebar requireAuth requireRegistration showBallot showSubmitButton sidebar="right">
      {appState === EAppState.VOTING && (
        <Form defaultValues={ballot} schema={BallotSchema} values={ballot} onSubmit={handleSubmit}>
          <BallotAllocationForm />
        </Form>
      )}

      {appState !== EAppState.VOTING && <div>You can only vote during the voting period.</div>}
    </LayoutWithSidebar>
  );
};

export default BallotPage;
