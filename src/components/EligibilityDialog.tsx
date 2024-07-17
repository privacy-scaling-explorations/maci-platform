import { useRouter } from "next/router";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useAccount, useDisconnect } from "wagmi";

import { useMaci } from "~/contexts/Maci";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import { Dialog } from "./ui/Dialog";

export const EligibilityDialog = (): JSX.Element | null => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const [openDialog, setOpenDialog] = useState<boolean>(!!address);
  const { onSignup, isEligibleToVote, isRegistered } = useMaci();
  const router = useRouter();

  const appState = useAppState();

  const onError = useCallback(() => toast.error("Signup error"), []);

  const handleSignup = useCallback(async () => {
    await onSignup(onError);
    setOpenDialog(false);
  }, [onSignup, onError, setOpenDialog]);

  useEffect(() => {
    setOpenDialog(!!address);
  }, [address, setOpenDialog]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, [setOpenDialog]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const handleGoToProjects = useCallback(() => {
    router.push("/projects");
  }, [router]);

  const handleGoToCreateApp = useCallback(() => {
    router.push("/applications/new");
  }, [router]);

  if (appState === EAppState.APPLICATION) {
    return (
      <Dialog
        button="secondary"
        buttonAction={handleGoToCreateApp}
        buttonName="Create Application"
        description={
          <div className="flex flex-col gap-4">
            <p>Start creating your own application now!</p>
          </div>
        }
        isOpen={openDialog}
        size="sm"
        title="You're all set to apply"
        onOpenChange={handleCloseDialog}
      />
    );
  }

  if (appState === EAppState.VOTING && isRegistered) {
    return (
      <Dialog
        button="secondary"
        buttonAction={handleGoToProjects}
        buttonName="See all projects"
        description={
          <div className="flex flex-col gap-4">
            <p>You have X voice credits to vote with.</p>

            <p>
              Get started by adding projects to your ballot, then adding the amount of votes you want to allocate to
              each one.
            </p>

            <p>Please submit your ballot by X date!</p>
          </div>
        }
        isOpen={openDialog}
        size="sm"
        title="You're all set to vote"
        onOpenChange={handleCloseDialog}
      />
    );
  }

  if (appState === EAppState.VOTING && !isRegistered && isEligibleToVote) {
    return (
      <Dialog
        button="secondary"
        buttonAction={handleSignup}
        buttonName="Join voting round"
        description={
          <div className="flex flex-col gap-6">
            <p>Next, you will need to join the voting round.</p>

            <i>
              <span>Learn more about this process </span>

              <a href="https://maci.pse.dev" rel="noreferrer" target="_blank">
                <u>here</u>
              </a>

              <span>.</span>
            </i>
          </div>
        }
        isOpen={openDialog}
        size="sm"
        title="Account verified!"
        onOpenChange={handleCloseDialog}
      />
    );
  }

  if (appState === EAppState.VOTING && !isEligibleToVote) {
    return (
      <Dialog
        button="secondary"
        buttonAction={handleDisconnect}
        buttonName="Disconnect"
        description="To participate in this round, you must be in the voter's registry. Contact the round organizers to get access as a voter."
        isOpen={openDialog}
        size="sm"
        title="Sorry, this account does not have the credentials to be verified."
        onOpenChange={handleCloseDialog}
      />
    );
  }

  if (appState === EAppState.TALLYING) {
    return (
      <Dialog
        description="The result is under tallying, please come back to check the result later."
        isOpen={openDialog}
        size="sm"
        title="The result is under tallying"
        onOpenChange={handleCloseDialog}
      />
    );
  }

  return <div />;
};
