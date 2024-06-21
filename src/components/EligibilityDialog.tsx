import { useAccount, useDisconnect } from "wagmi";
import { toast } from "sonner";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";

import { Dialog } from "./ui/Dialog";
import { useMaci } from "~/contexts/Maci";

export const EligibilityDialog = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const [openDialog, setOpenDialog] = useState<boolean>(!!address);
  const { onSignup, isEligibleToVote, isRegistered } = useMaci();
  const router = useRouter();

  const onError = useCallback(() => toast.error("Signup error"), []);

  const handleSignup = useCallback(async () => {
    await onSignup(onError);
    setOpenDialog(false);
  }, [onSignup, onError, setOpenDialog]);

  useEffect(() => {
    setOpenDialog(!!address);
  }, [address, setOpenDialog]);

  return (
    <div>
      {isRegistered && (
        <Dialog
          size="sm"
          isOpen={openDialog}
          onOpenChange={() => setOpenDialog(false)}
          title="You're all set to vote"
          description={
            <div className="flex flex-col gap-4">
              <p>You have X voice credits to vote with.</p>
              <p>
                Get started by adding projects to your ballot, then adding the
                amount of votes you want to allocate to each one.
              </p>
              <p>Please submit your ballot by X date!</p>
            </div>
          }
          button="secondary"
          buttonName="See all projects"
          buttonAction={() => router.push("/projects")}
        />
      )}
      {!isRegistered && isEligibleToVote && (
        <Dialog
          size="sm"
          isOpen={openDialog}
          onOpenChange={() => setOpenDialog(false)}
          title="Account verified!"
          description={
            <div className="flex flex-col gap-6">
              <p>Next, you will need to join the voting round.</p>
              <p>
                <i>
                  Learn more about this process{" "}
                  <a href="https://maci.pse.dev" target="_blank">
                    <u>here</u>
                  </a>
                  .
                </i>
              </p>
            </div>
          }
          button="secondary"
          buttonName="Join voting round"
          buttonAction={handleSignup}
        />
      )}
      {!isEligibleToVote && (
        <Dialog
          size="sm"
          isOpen={openDialog}
          onOpenChange={() => setOpenDialog(false)}
          title="Sorry, this account does not have the credentials to be verified."
          description="To participate in this round, you must be in the voter's registry. Contact the round organizers to get access as a voter."
          button="secondary"
          buttonName="Disconnect"
          buttonAction={() => disconnect()}
        />
      )}
    </div>
  );
};
