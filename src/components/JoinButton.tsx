import { toast } from "sonner";
import { useCallback } from "react";

import { useMaci } from "~/contexts/Maci";
import { Button } from "./ui/Button";
import { getAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

export const JoinButton = () => {
  const { isLoading, isRegistered, isEligibleToVote, onSignup } = useMaci();
  const appState = getAppState();

  const onError = useCallback(() => toast.error("Signup error"), []);
  const handleSignup = useCallback(
    () => onSignup(onError),
    [onSignup, onError],
  );

  const applyApplication = () => {};

  const viewResults = () => {};

  return (
    <div>
      {appState === EAppState.VOTING && !isEligibleToVote && (
        <Button variant="disabled">You are not allowed to vote</Button>
      )}

      {appState === EAppState.VOTING && isEligibleToVote && !isRegistered && (
        <Button
          variant={
            isRegistered === undefined || isLoading ? "disabled" : "primary"
          }
          onClick={handleSignup}
        >
          Voter sign up
        </Button>
      )}

      {appState === EAppState.APPLICATION && (
        <Button variant="secondary" onClick={applyApplication}>
          Project sign up
        </Button>
      )}

      {appState === EAppState.TALLYING && (
        <Button variant="disabled">
          Voting round is over, the result is tallying.
        </Button>
      )}

      {appState === EAppState.RESULTS && (
        <Button variant="primary" onClick={viewResults}>
          View results
        </Button>
      )}
    </div>
  );
};
