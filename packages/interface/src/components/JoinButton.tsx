import { useCallback } from "react";
import { toast } from "sonner";

import { useMaci } from "~/contexts/Maci";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import { Button } from "./ui/Button";

export const JoinButton = (): JSX.Element => {
  const { isLoading, isRegistered, isEligibleToVote, onSignup } = useMaci();
  const appState = useAppState();

  const onError = useCallback(() => toast.error("Signup error"), []);
  const handleSignup = useCallback(() => onSignup(onError), [onSignup, onError]);
  return (
    <div>
      {appState === EAppState.VOTING && !isEligibleToVote && (
        <Button variant="disabled">You are not allowed to vote</Button>
      )}

      {appState === EAppState.VOTING && isEligibleToVote && !isRegistered && (
        <Button variant={isRegistered === undefined || isLoading ? "disabled" : "primary"} onClick={handleSignup}>
          Voter sign up
        </Button>
      )}

      {appState === EAppState.TALLYING && (
        <Button variant="disabled">Voting round is over, the result is tallying.</Button>
      )}

      {appState === EAppState.RESULTS && <Button variant="primary">View results</Button>}
    </div>
  );
};
