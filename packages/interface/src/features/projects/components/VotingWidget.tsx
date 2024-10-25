import Image from "next/image";
import { useMemo, useCallback, useState, type ChangeEvent } from "react";
import { NumericFormat } from "react-number-format";

import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";

import { EButtonState } from "../types";

interface IVotingWidgetProps {
  projectId: string;
  pollId: string;
  projectIndex: number;
}

export const VotingWidget = ({ projectId, pollId, projectIndex }: IVotingWidgetProps): JSX.Element => {
  const { initialVoiceCredits } = useMaci();
  const { ballotContains, removeFromBallot, addToBallot } = useBallot();

  const projectBallot = useMemo(() => ballotContains(projectIndex, pollId), [ballotContains, projectIndex]);
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
    removeFromBallot(projectIndex, pollId);
    setAmount(0);
    setButtonState(0);
  }, [projectIndex, removeFromBallot]);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(Number.parseInt(e.target.value, 10));

    if (buttonState === EButtonState.ADDED || buttonState === EButtonState.UPDATED) {
      setButtonState(EButtonState.EDIT);
    }
  };

  const handleButtonAction = () => {
    if (amount === undefined) {
      return;
    }

    addToBallot([{ projectId, amount, projectIndex }], pollId);
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
          className="cursor-pointer text-gray-400 underline hover:text-black dark:hover:text-blue-400"
          type="button"
          onClick={handleRemove}
        >
          Remove from My Ballot
        </button>
      )}

      <div className="mt-4 flex items-center justify-center gap-5 rounded-xl border border-gray-200 p-5 sm:mt-0 dark:border-gray-800">
        <NumericFormat
          allowNegative={false}
          aria-label="allocation-input"
          autoComplete="off"
          className="dark:bg-lightBlack w-auto dark:text-white"
          customInput={Input}
          decimalScale={0}
          defaultValue={amount}
          isAllowed={({ floatValue }) => (floatValue ?? 0) <= initialVoiceCredits && (floatValue ?? 0) >= 0}
          thousandSeparator=","
          onChange={handleInput}
        />

        {buttonState === EButtonState.DEFAULT && (
          <Button variant="inverted" onClick={handleButtonAction}>
            add votes
          </Button>
        )}

        {buttonState === EButtonState.ADDED && (
          <div className="flex justify-center gap-2 uppercase dark:text-white">
            votes added
            <Image alt="check-black" className="dark:invert" height="16" src="/check-black.svg" width="16" />
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
            <Image alt="check-black" className="dark:invert" height="16" src="/check-black.svg" width="16" />
          </div>
        )}
      </div>
    </div>
  );
};
