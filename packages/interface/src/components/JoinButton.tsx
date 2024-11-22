/* eslint-disable no-console */
import { decStringToBigIntToUuid } from "@pcd/util";
import { ZKEdDSAEventTicketPCDPackage, ZKEdDSAEventTicketPCDClaim } from "@pcd/zk-eddsa-event-ticket-pcd";
import { zuAuthPopup } from "@pcd/zuauth";
import { GatekeeperTrait, getZupassGatekeeperData } from "maci-cli/sdk";
import { useCallback } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import { zupass, config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { useClaimFunds } from "~/features/home/hooks/useFetchFaucet";
import { useEthersSigner } from "~/hooks/useEthersSigner";
import { jsonPCD } from "~/utils/types";

import type { EdDSAPublicKey } from "@pcd/eddsa-pcd";
import type { PCD } from "@pcd/pcd-types";
import type { Groth16Proof } from "snarkjs";

import { Button } from "./ui/Button";

export const JoinButton = (): JSX.Element => {
  const { isLoading, isRegistered, isEligibleToVote, onSignup, gatekeeperTrait, storeZupassProof, zupassProof } =
    useMaci();
  const signer = useEthersSigner();
  const { address } = useAccount();

  const onError = useCallback((error?: Error | string) => toast.error(`Signup error: ${error?.toString() ?? ""}`), []);
  const claimFund = useClaimFunds(address ?? "", zupassProof as PCD<ZKEdDSAEventTicketPCDClaim, Groth16Proof>);

  const handleSignup = useCallback(() => {
    if (claimFund.data === undefined) {
      claimFund.refetch();
      return;
    }

    if (claimFund.data.error) {
      onError(claimFund.data.error);
      return;
    }

    onSignup(onError);
  }, [onSignup, onError]);

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
  }, [signer, address, storeZupassProof]);

  if (!isEligibleToVote && gatekeeperTrait === GatekeeperTrait.Zupass) {
    return (
      <div>
        <Button
          className="mb-4 sm:mb-0"
          variant={isRegistered === undefined || isLoading ? "disabled" : "primary"}
          onClick={handleZupassVerify}
        >
          Prove you can join with Zupass
        </Button>
      </div>
    );
  }

  if (isEligibleToVote && !isRegistered) {
    return (
      <div>
        <Button
          className="mb-4 sm:mb-0"
          variant={isRegistered === undefined || isLoading ? "disabled" : "primary"}
          onClick={handleSignup}
        >
          Sign up to vote
        </Button>
      </div>
    );
  }

  if (!isEligibleToVote) {
    return (
      <div>
        <Button className="mb-4 sm:mb-0" variant="disabled">
          You are not allowed to vote
        </Button>
      </div>
    );
  }

  return <div />;
};
