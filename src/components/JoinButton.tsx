import { toast } from "sonner";
import { useCallback } from "react";

import { useMaci } from "~/contexts/Maci";
import { Chip } from "./ui/Chip";
import { getAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";
import { Toaster } from "~/components/Toaster";

export const JoinButton = () => {
  const { isLoading, isRegistered, isEligibleToVote, onSignup } = useMaci();
  const appState = getAppState();

  const onError = useCallback(() => toast.error("Signup error"), []);
  const handleSignup = useCallback(
    () => onSignup(onError),
    [onSignup, onError],
  );

  return (
    <div>
      <Toaster />

      {appState === EAppState.VOTING && !isEligibleToVote && (
        <Chip color="disabled">You are not allowed to vote</Chip>
      )}

      {appState === EAppState.VOTING && isEligibleToVote && !isRegistered && (
        <Chip
          color={
            isRegistered === undefined || isLoading ? "disabled" : "primary"
          }
          onClick={handleSignup}
        >
          Voter sign up
        </Chip>
      )}

      {appState === EAppState.APPLICATION && (
        <Chip color="secondary" onClick={applyApplication}>
          Project sign up
        </Chip>
      )}

      {appState === EAppState.TALLYING && (
        <Chip color="disabled">
          Voting round is over, the result is tallying.
        </Chip>
      )}

      {appState === EAppState.RESULTS && (
        <Chip color="primary" onClick={viewResults}>
          View results
        </Chip>
      )}
    </div>
  );
};
