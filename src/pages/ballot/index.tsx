import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useAccount } from "wagmi";
import { Button } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { Form } from "~/components/ui/Form";
import { AllocationFormWrapper } from "~/features/ballot/components/AllocationList";
import { BallotSchema } from "~/features/ballot/types";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import { useBallot } from "~/contexts/Ballot";
import { formatNumber } from "~/utils/formatNumber";
import { getAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

export default function BallotPage() {
  const { address, isConnecting } = useAccount();
  const { ballot } = useBallot();
  const router = useRouter();

  useEffect(() => {
    if (!address && !isConnecting) {
      router.push("/").catch(console.log);
    }
  }, [address, isConnecting, router]);

  const votes = useMemo(
    () => ballot?.votes?.sort((a, b) => b.amount - a.amount),
    [ballot],
  );

  if (!votes) {
    return <EmptyBallot />;
  }

  return (
    <LayoutWithSidebar sidebar="right" requireAuth showBallot showSubmitButton>
      <Form
        schema={BallotSchema}
        defaultValues={ballot}
        values={ballot}
        onSubmit={console.log}
      >
        <BallotAllocationForm />
      </Form>
    </LayoutWithSidebar>
  );
}

function BallotAllocationForm() {
  const appState = getAppState();
  const { ballot, sumBallot } = useBallot();

  const sum = useMemo(
    () => formatNumber(sumBallot(ballot?.votes)),
    [ballot, sumBallot],
  );

  return (
    <div className="px-8">
      <h1 className="text-4xl uppercase tracking-tighter">My Ballot</h1>
      <p className="my-4 text-gray-400">
        Once you have reviewed your vote allocation, you can submit your ballot.
      </p>
      <div className="mb-4 justify-end sm:flex">
        {ballot?.votes?.length ? <ClearBallot /> : null}
      </div>
      <div className="border-t border-gray-300">
        <div className="p-8">
          {ballot?.votes?.length ? (
            <AllocationFormWrapper
              disabled={appState === EAppState.RESULTS}
              projectIsLink
            />
          ) : (
            <EmptyBallot />
          )}
        </div>

        <div className="flex h-16 items-center justify-end gap-2">
          <h4>Total votes:</h4>
          <p>{sum}</p>
        </div>
      </div>
    </div>
  );
}

function ClearBallot() {
  const form = useFormContext();
  const [isOpen, setOpen] = useState(false);
  const { deleteBallot } = useBallot();

  if ([EAppState.TALLYING, EAppState.RESULTS].includes(getAppState()))
    return null;

  const handleClearBallot = () => {
    deleteBallot();
    setOpen(false);
    form.reset({ votes: [] });
  };

  return (
    <>
      <div
        className="cursor-pointer text-gray-400 underline hover:text-black"
        onClick={() => setOpen(true)}
      >
        Remove all projects
      </div>

      <Dialog
        title="Are you sure?"
        size="sm"
        isOpen={isOpen}
        onOpenChange={setOpen}
        description="This will empty your ballot and remove all the projects you have added."
        button="primary"
        buttonName="Yes, Clear my ballot"
        buttonAction={handleClearBallot}
      />
    </>
  );
}

const EmptyBallot = () => (
  <div className="flex flex-1 items-center justify-center">
    <div className=" max-w-[360px] space-y-4">
      <h3 className="text-center text-lg font-bold">Your ballot is empty</h3>
      <p className="text-center text-sm text-gray-700">
        Your ballot currently doesn&apos;t have any projects added. Browse
        through the available projects.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button as={Link} href={"/projects"} variant="primary" size="auto">
          View projects
        </Button>
      </div>
    </div>
  </div>
);
