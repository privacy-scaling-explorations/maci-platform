import clsx from "clsx";
import { Check } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useAccount } from "wagmi";
import { z } from "zod";

import { Alert } from "~/components/ui/Alert";
import { Button, IconButton } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { Form } from "~/components/ui/Form";
import { config } from "~/config";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { AllocationInput } from "~/features/ballot/components/AllocationInput";
import { formatNumber } from "~/utils/formatNumber";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

interface IProjectAddToBallotProps {
  id?: string;
  name?: string;
}

const ProjectAllocation = ({
  current = 0,
  inBallot,
  onRemove,
}: {
  current: number;
  inBallot: boolean;
  onRemove: () => void;
}) => {
  const form = useFormContext();
  const formAmount = form.watch("amount") as string;
  const amount = formAmount ? parseFloat(String(formAmount).replace(/,/g, "")) : 0;
  const total = (config.pollMode === "qv" ? amount ** 2 : amount) + current;
  const { initialVoiceCredits } = useMaci();

  const exceededProjectTokens = amount > initialVoiceCredits;
  const exceededMaxTokens = total > initialVoiceCredits;

  const isError = exceededProjectTokens || exceededMaxTokens;
  return (
    <div>
      <AllocationInput tokenAddon error={isError} name="amount" votingMaxProject={initialVoiceCredits} />

      <div className="flex justify-between gap-2 pt-2 text-sm">
        <div className="flex gap-2">
          <span className="text-gray-600 dark:text-gray-400">Total allocated:</span>

          <span
            className={clsx("font-semibold", {
              "text-primary-500": exceededMaxTokens,
            })}
          >
            {formatNumber(total)}
          </span>
        </div>

        <div className="flex gap-2">
          <span
            className={clsx("font-semibold", {
              "text-primary-500": exceededProjectTokens,
            })}
          >
            {formatNumber(initialVoiceCredits - total)}
          </span>

          <span className="text-gray-600 dark:text-gray-400">/</span>

          <span className="text-gray-600 dark:text-gray-400">{formatNumber(initialVoiceCredits)}</span>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <Button className="w-full" disabled={isError} type="submit" variant="primary">
          {inBallot ? "Update" : "Add"} vote
        </Button>

        {inBallot ? (
          <Button className="w-full" type="button" variant="ghost" onClick={onRemove}>
            Remove from vote
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export const ProjectAddToBallot = ({ id, name }: IProjectAddToBallotProps) => {
  const { address } = useAccount();
  const [isOpen, setOpen] = useState(false);

  const { isRegistered, isEligibleToVote, initialVoiceCredits, pollId } =
    useMaci();
  const { ballot, ballotContains, sumBallot, addToBallot, removeFromBallot } =
    useBallot();

  const inBallot = ballotContains(id!);
  const allocations = ballot?.votes ?? [];
  const sum = sumBallot(allocations.filter((p) => p.projectId !== id));
  const numVotes = ballot?.votes?.length ?? 0;

  if (useAppState() !== EAppState.VOTING) return null;

  return (
    <div>
      {numVotes > config.voteLimit && (
        <Alert variant="warning">
          You have exceeded your vote limit. You can only vote for{" "}
          {config.voteLimit} options.
        </Alert>
      )}

      {!isEligibleToVote || !isRegistered ? null : ballot?.published ? (
        <Button disabled>Ballot published</Button>
      ) : inBallot ? (
        <IconButton
          onClick={() => setOpen(true)}
          variant="primary"
          icon={Check}
        >
          {formatNumber(config.pollMode === "qv" ? inBallot.amount ** 2 : inBallot.amount)} allocated
        </IconButton>
      ) : (
        <Button
          disabled={!address || numVotes > config.voteLimit}
          onClick={() => setOpen(true)}
          variant="primary"
          className="w-full md:w-auto"
        >
          Add to ballot
        </Button>
      )}
      <Dialog
        size="sm"
        isOpen={isOpen}
        onOpenChange={setOpen}
        title={`Vote for ${name}`}
      >
        <p className="pb-4 leading-relaxed">
          How much {config.tokenName} should this Project receive to fill the
          gap between the impact they generated for Optimism and the profit they
          received for generating this impact
        </p>
        <Form
          defaultValues={{ amount: inBallot?.amount }}
          schema={z.object({
            amount: z
              .number()
              .min(0)
              .max(Math.sqrt(Math.min(initialVoiceCredits, initialVoiceCredits - sum)))
              .default(0),
          })}
          onSubmit={({ amount }) => {
            addToBallot([{ projectId: id!, amount }], pollId);
            setOpen(false);
          }}
        >
          <ProjectAllocation
            current={sum}
            inBallot={Boolean(inBallot)}
            onRemove={() => {
              removeFromBallot(id!);
              setOpen(false);
            }}
          />
        </Form>
      </Dialog>
    </div>
  );
};
