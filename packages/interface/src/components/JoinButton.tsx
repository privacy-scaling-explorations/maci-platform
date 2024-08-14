import { useCallback } from "react";
import { toast } from "sonner";

import { useMaci } from "~/contexts/Maci";

import { Button } from "./ui/Button";

export const JoinButton = (): JSX.Element => {
  const { isLoading, isRegistered, isEligibleToVote, onSignup } = useMaci();

  const onError = useCallback(() => toast.error("Signup error"), []);
  const handleSignup = useCallback(() => onSignup(onError), [onSignup, onError]);

  return (
    <div>
      {!isEligibleToVote && <Button variant="disabled">You are not allowed to vote</Button>}

      {isEligibleToVote && !isRegistered && (
        <Button variant={isRegistered === undefined || isLoading ? "disabled" : "primary"} onClick={handleSignup}>
          Voter sign up
        </Button>
      )}
    </div>
  );
};
