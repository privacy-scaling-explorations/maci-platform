import { useMemo, useCallback, useState } from "react";

import { useMaci } from "~/contexts/Maci";
import { useBallot } from "~/contexts/Ballot";
import { Input } from "~/components/ui/Input";
import { Button } from "~/components/ui/Button";
import { EButtonState } from "../types";

export const VotingWidget = ({ projectId }: { projectId: string }) => {
  const { pollId } = useMaci();
  const { ballotContains, removeFromBallot, addToBallot } = useBallot();
  const projectBallot = useMemo(
    () => ballotContains(projectId),
    [ballotContains, projectId],
  );
  const projectIncluded = useMemo(() => !!projectBallot, [projectBallot]);
  const [amount, setAmount] = useState<number | undefined>(
    projectBallot?.amount,
  );

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
  }, [removeFromBallot]);

  const handleInput = (e: Event) => {
    setAmount(e.target?.value as number);

    if (
      buttonState === EButtonState.ADDED ||
      buttonState === EButtonState.UPDATED
    ) {
      setButtonState(EButtonState.EDIT);
    }
  };

  const handleButtonAction = () => {
    if (!amount) return;

    addToBallot([{ projectId, amount }], pollId);
    if (buttonState === EButtonState.DEFAULT)
      setButtonState(EButtonState.ADDED);
    else setButtonState(EButtonState.UPDATED);
  };

  return (
    <div className="flex items-center justify-center gap-5">
      {projectIncluded && (
        <div
          onClick={handleRemove}
          className="cursor-pointer text-gray-400 underline hover:text-black"
        >
          Remove from My Ballot
        </div>
      )}
      <div className="flex items-center justify-center gap-5 rounded-xl border border-gray-200 p-5">
        <Input
          type="number"
          placeholder="Add votes here"
          onChange={handleInput}
          value={amount}
          className="w-auto"
        />
        {buttonState === EButtonState.DEFAULT && (
          <Button onClick={handleButtonAction} variant="inverted">
            add votes
          </Button>
        )}
        {buttonState === EButtonState.ADDED && (
          <div className="flex justify-center gap-2 uppercase">
            votes added
            <img src="/check-black.svg" alt="" />
          </div>
        )}
        {buttonState === EButtonState.EDIT && (
          <Button onClick={handleButtonAction} variant="inverted">
            edit votes
          </Button>
        )}
        {buttonState === EButtonState.UPDATED && (
          <div className="flex justify-center gap-2 uppercase">
            votes updated
            <img src="/check-black.svg" alt="" />
          </div>
        )}
      </div>
    </div>
  );
};
