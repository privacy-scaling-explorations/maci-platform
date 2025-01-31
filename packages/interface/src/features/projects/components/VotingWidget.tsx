import { useMemo, useCallback, useState } from "react";

import { Button } from "~/components/ui/Button";
import { useBallot } from "~/contexts/Ballot";

import { EButtonState } from "../types";

interface IVotingWidgetProps {
  projectId: string;
  pollId: string;
  projectIndex: number;
}

export const VotingWidget = ({ projectId, pollId, projectIndex }: IVotingWidgetProps): JSX.Element => {
  const { ballotContains, removeFromBallot, addToBallot } = useBallot();

  const projectBallot = useMemo(() => ballotContains(projectIndex, pollId), [ballotContains, projectIndex]);
  const projectIncluded = useMemo(() => !!projectBallot, [projectBallot]);

  /**
   * buttonState
   * 0. this project is not included in the ballot before
   * 1. this project is included in the ballot before
   */
  const [buttonState, setButtonState] = useState<EButtonState>(
    projectIncluded ? EButtonState.ADDED : EButtonState.DEFAULT,
  );

  const handleRemove = useCallback(() => {
    removeFromBallot(projectIndex, pollId);
    setButtonState(0);
  }, [projectIndex, removeFromBallot]);

  const handleButtonAction = () => {
    addToBallot([{ projectId, amount: 0, projectIndex }], pollId);
    if (buttonState === EButtonState.DEFAULT) {
      setButtonState(EButtonState.ADDED);
    } else {
      setButtonState(EButtonState.UPDATED);
    }
  };

  return (
    <div className="flex items-center justify-center gap-5">
      {projectIncluded && (
        <Button variant="inverted" onClick={handleRemove}>
          Remove from ballot
        </Button>
      )}

      {buttonState === EButtonState.DEFAULT && (
        <Button variant="inverted" onClick={handleButtonAction}>
          Add to ballot
        </Button>
      )}
    </div>
  );
};
