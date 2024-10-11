/* eslint-disable no-console */
import { decStringToBigIntToUuid } from "@pcd/util";
import { ZKEdDSAEventTicketPCDPackage } from "@pcd/zk-eddsa-event-ticket-pcd";
import { zuAuthPopup } from "@pcd/zuauth";
import { GatekeeperTrait, getZupassGatekeeperData } from "maci-cli/sdk";
import { useRouter } from "next/router";
import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAccount, useDisconnect } from "wagmi";

import { zupass, config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";
import { useEthersSigner } from "~/hooks/useEthersSigner";
import { useRoundState } from "~/utils/state";
import { ERoundState, jsonPCD } from "~/utils/types";

import type { EdDSAPublicKey } from "@pcd/eddsa-pcd";

import { Dialog } from "./ui/Dialog";

interface IEligibilityDialogProps {
  pollId?: string;
}

export const EligibilityDialog = ({ pollId = "" }: IEligibilityDialogProps): JSX.Element | null => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { getRoundByPollId } = useRound();

  const [openDialog, setOpenDialog] = useState<boolean>(!!address);
  const { onSignup, isEligibleToVote, isRegistered, initialVoiceCredits, gatekeeperTrait, storeZupassProof } =
    useMaci();
  const router = useRouter();

  const roundState = useRoundState({ pollId });

  const votingEndsAt = useMemo(() => {
    const round = getRoundByPollId(pollId);
    return round?.votingEndsAt ? new Date(round.votingEndsAt) : new Date();
  }, [pollId, getRoundByPollId]);

  const onError = useCallback(() => toast.error("Signup error"), []);

  const signer = useEthersSigner();

  const handleSignup = useCallback(async () => {
    await onSignup(onError);
    setOpenDialog(false);
  }, [onSignup, onError, setOpenDialog]);

  const handleZupassVerify = useCallback(async () => {
    if (address !== undefined && signer) {
      const zupassGatekeeperData = await getZupassGatekeeperData({ maciAddress: config.maciAddress!, signer });
      const eventId = decStringToBigIntToUuid(zupassGatekeeperData.eventId);
      const result = await zuAuthPopup({
        fieldsToReveal: {
          revealTicketId: true,
          revealEventId: true,
        },
        watermark: address,
        config: [
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            eventName: zupass.eventName,
          },
        ],
      });
      if (result.type === "pcd") {
        try {
          const parsedPCD = (JSON.parse(result.pcdStr) as jsonPCD).pcd;
          const pcd = await ZKEdDSAEventTicketPCDPackage.deserialize(parsedPCD);
          await storeZupassProof(pcd);
        } catch (e) {
          console.error("zupass error:", e);
        }
      }
    }
  }, [signer, setOpenDialog, address, storeZupassProof]);

  useEffect(() => {
    setOpenDialog(!!address);
  }, [address, setOpenDialog]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, [setOpenDialog]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const handleGoToCreateApp = useCallback(() => {
    router.push(`/rounds/${pollId}/applications/new`);
  }, [router, pollId]);

  if (roundState === ERoundState.APPLICATION) {
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

  if (roundState === ERoundState.VOTING && isRegistered) {
    return (
      <Dialog
        button="secondary"
        description={
          <div className="flex flex-col gap-4">
            <p>You have {initialVoiceCredits} voice credits to vote with.</p>

            <p>
              Get started by adding projects to your ballot, then adding the amount of votes you want to allocate to
              each one.
            </p>

            <p>Please submit your ballot by {votingEndsAt.toString()}!</p>
          </div>
        }
        isOpen={openDialog}
        size="sm"
        title="You're all set to vote for rounds!"
        onOpenChange={handleCloseDialog}
      />
    );
  }

  if (roundState === ERoundState.VOTING && !isRegistered && isEligibleToVote) {
    return (
      <Dialog
        button="secondary"
        buttonAction={handleSignup}
        buttonName="Join voting rounds"
        description={
          <div className="flex flex-col gap-6">
            <p>Next, you will need to register to the event to join the voting rounds.</p>

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

  if (roundState === ERoundState.VOTING && !isEligibleToVote && gatekeeperTrait === GatekeeperTrait.Zupass) {
    return (
      <Dialog
        button="secondary"
        buttonAction={handleZupassVerify}
        buttonName="Generate Proof"
        description="To participate in this round, you need to generate a Proof with Zupass and then signup."
        isOpen={openDialog}
        size="sm"
        title="Signup with Zupass"
        onOpenChange={handleCloseDialog}
      />
    );
  }

  if (roundState === ERoundState.VOTING && !isEligibleToVote) {
    return (
      <Dialog
        button="secondary"
        buttonAction={handleDisconnect}
        buttonName="Disconnect"
        description="To participate in the event, you must be in the voter's registry. Contact the round organizers to get access as a voter."
        isOpen={openDialog}
        size="sm"
        title="Sorry, this account does not have the credentials to be verified."
        onOpenChange={handleCloseDialog}
      />
    );
  }

  if (roundState === ERoundState.TALLYING) {
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
