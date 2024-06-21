import clsx from "clsx";
import { Check } from "lucide-react";
import { useCallback, useState } from "react";
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
  const total = amount + current;
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
            {formatNumber(total - amount)}
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

export const ProjectAddToBallot = ({ id = "", name = "" }: IProjectAddToBallotProps): JSX.Element | null => {
  const { address } = useAccount();
  const [isOpen, setOpen] = useState(false);

  const { isRegistered, isEligibleToVote, initialVoiceCredits, pollId } = useMaci();
  const { ballot, ballotContains, sumBallot, addToBallot, removeFromBallot } = useBallot();

  const inBallot = ballotContains(id);
  const allocations = ballot?.votes ?? [];
  const sum = sumBallot(allocations.filter((p) => p.projectId !== id));
  const numVotes = ballot?.votes.length ?? 0;

  const dialogMessage = `How much ${config.tokenName} should this Project receive to fill the gap between the impact they generated for
  ${config.roundOrganizer} and the profit they received for generating this impact`;

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  if (useAppState() !== EAppState.VOTING) {
    return null;
  }

  return (
    <div>
      {numVotes > config.voteLimit && (
        <Alert variant="warning">
          You have exceeded your vote limit. You can only vote for {config.voteLimit} options.
        </Alert>
      )}

      {isEligibleToVote && isRegistered ? (
        <>
          {ballot?.published && <Button disabled>Vote published</Button>}

          {!ballot?.published && inBallot && (
            <IconButton icon={Check} variant="primary" onClick={handleOpen}>
              {formatNumber(inBallot.amount)} allocated
            </IconButton>
          )}

          {!ballot?.published && !inBallot && (
            <Button
              className="w-full md:w-auto"
              disabled={!address || numVotes > config.voteLimit}
              variant="primary"
              onClick={handleOpen}
            >
              Add to vote
            </Button>
          )}
        </>
      ) : null}

      <Dialog isOpen={isOpen} size="sm" title={`Vote for ${name}`} onOpenChange={setOpen}>
        <p className="pb-4 leading-relaxed">{dialogMessage}</p>

        <Form
          defaultValues={{ amount: inBallot?.amount }}
          schema={z.object({
            amount: z
              .number()
              .min(0)
              .max(Math.min(initialVoiceCredits, initialVoiceCredits - sum))
              .default(0),
          })}
          onSubmit={({ amount }) => {
            addToBallot([{ projectId: id, amount }], pollId!);
            setOpen(false);
          }}
        >
          <ProjectAllocation
            current={sum}
            inBallot={Boolean(inBallot)}
            onRemove={() => {
              removeFromBallot(id);
              setOpen(false);
            }}
          />
        </Form>
      </Dialog>
    </div>
  );
};
