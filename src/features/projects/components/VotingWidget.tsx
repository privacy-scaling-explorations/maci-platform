import { useMemo, useCallback, useState, type ChangeEvent } from "react";

import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";

import { EButtonState } from "../types";

export const VotingWidget = ({ projectId }: { projectId: string }): JSX.Element => {
  const { pollId } = useMaci();
  const { ballotContains, removeFromBallot, addToBallot } = useBallot();
  const projectBallot = useMemo(() => ballotContains(projectId), [ballotContains, projectId]);
  const projectIncluded = useMemo(() => !!projectBallot, [projectBallot]);
  const [amount, setAmount] = useState<number | undefined>(projectBallot?.amount);

  /**
   * buttonState
   * 0. this project is not included in the ballot before
   * 1. this project is included in the ballot before
   * 2. after onChange from a value to another value (original state is 1)
   * 3. after edited
   */
  const [buttonState, setButtonState] = useState<EButtonState>(
    projectIncluded ? EButtonState.ADDED : EButtonState.DEFAULT,
  );

  const handleRemove = useCallback(() => {
    removeFromBallot(projectId);
    setAmount(undefined);
    setButtonState(0);
  }, [projectId, removeFromBallot]);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value as unknown as number);

    if (buttonState === EButtonState.ADDED || buttonState === EButtonState.UPDATED) {
      setButtonState(EButtonState.EDIT);
    }
  };

  const handleButtonAction = () => {
    if (!amount) {
      return;
    }

    addToBallot([{ projectId, amount }], pollId);
    if (buttonState === EButtonState.DEFAULT) {
      setButtonState(EButtonState.ADDED);
    } else {
      setButtonState(EButtonState.UPDATED);
    }
  };

  return (
    <div className="flex items-center justify-center gap-5">
      {projectIncluded && (
        <button
          className="cursor-pointer text-gray-400 underline hover:text-black"
          type="button"
          onClick={handleRemove}
        >
          Remove from My Ballot
        </button>
      )}

      <div className="flex items-center justify-center gap-5 rounded-xl border border-gray-200 p-5">
        <Input className="w-auto" placeholder="Add votes here" type="number" value={amount} onChange={handleInput} />

        {buttonState === EButtonState.DEFAULT && (
          <Button variant="inverted" onClick={handleButtonAction}>
            add votes
          </Button>
        )}

        {buttonState === EButtonState.ADDED && (
          <div className="flex justify-center gap-2 uppercase">
            votes added
            <img alt="check-black" src="/check-black.svg" />
          </div>
        )}

        {buttonState === EButtonState.EDIT && (
          <Button variant="inverted" onClick={handleButtonAction}>
            edit votes
          </Button>
        )}

        {buttonState === EButtonState.UPDATED && (
          <div className="flex justify-center gap-2 uppercase">
            votes updated
            <img alt="check-black" src="/check-black.svg" />
          </div>
        )}
      </div>
    </div>
  );
};
