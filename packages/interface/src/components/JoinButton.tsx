/* eslint-disable no-console */
import { decStringToBigIntToUuid } from "@pcd/util";
import { ZKEdDSAEventTicketPCDPackage } from "@pcd/zk-eddsa-event-ticket-pcd";
import { zuAuthPopup } from "@pcd/zuauth";
import { GatekeeperTrait, getZupassGatekeeperData } from "maci-cli/sdk";
import { useCallback } from "react";
import { toast } from "sonner";

import { zupass, config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { useEthersSigner } from "~/hooks/useEthersSigner";
import { useSmartAccount } from "~/utils/accountAbstraction";
import { jsonPCD } from "~/utils/types";

import type { EdDSAPublicKey } from "@pcd/eddsa-pcd";

import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";

export const JoinButton = (): JSX.Element => {
  const { isLoading, isRegistered, isEligibleToVote, onSignup, gatekeeperTrait, storeZupassProof } = useMaci();
  const { smartAccountClient } = useSmartAccount();

  const signer = useEthersSigner({ client: smartAccountClient });

  const onError = useCallback(() => toast.error("Signup error"), []);
  const handleSignup = useCallback(() => onSignup(onError), [onSignup, onError]);

  const handleZupassVerify = useCallback(async () => {
    if (signer && smartAccountClient?.account?.address) {
      const zupassGatekeeperData = await getZupassGatekeeperData({ maciAddress: config.maciAddress!, signer });
      const eventId = decStringToBigIntToUuid(zupassGatekeeperData.eventId);
      const result = await zuAuthPopup({
        fieldsToReveal: {
          revealTicketId: true,
          revealEventId: true,
          revealProductId: true,
        },
        watermark: smartAccountClient.account.address,
        config: [
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "220f81f4-ca7b-4e47-bfb7-14bf1aa94a89",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "45b07aad-b4cf-4f0e-861b-683ba3de49bd",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "e6df2335-00d5-4ee1-916c-977d326a9049",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "2ab74a56-4182-4798-a485-6380f87d6299",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "9fb49dd1-edea-4c57-9ff2-6e6c9c3b4a0a",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "1ad9e110-8745-4eed-8ca5-ee5b8cd69c0f",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "6b0f70f1-c757-40a1-b6ab-a9ddab221615",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "08482abb-8767-47aa-be47-2691032403b6",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "2a86d360-4ca2-43b5-aeb5-9a070da9a992",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "c900d46a-99fd-4f7a-8d6b-10d041b2601b",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "3de2fcc5-3822-460c-8175-2eef211d2f1d",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "c97cb25e-302b-4696-ac24-2a7a8255572e",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "695cedfe-a973-4371-acc4-907bde4251c5",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "41a055e0-db9c-41ff-8e9c-5834c9d64c6d",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "b50febf2-a258-4ee6-b3e4-2b2c2e57a74e",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "f15237ec-abd9-40ae-8e61-9cf8a7a60c3f",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "a4c658af-0b37-41ac-aa0a-850b6b7741be",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "c64cac28-5719-4260-bd9a-ea0c0cb04d54",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "bc67b24b-52e1-418e-832a-568d1ae5a58c",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "b44cac2f-92b5-405e-9aa1-7127661790e2",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "81620f49-d7fc-4ccb-a7bb-0ad81d97191a",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "1bbc0ec1-5be9-43ff-acd3-d4ca794f814f",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "1bbc0ec1-5be9-43ff-acd3-d4ca794f814f",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "3c30c8e0-4f96-4b46-b2c9-72954e31ab51",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "f4f14100-f816-4e2e-a770-78dacaee4e2f",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "5dcea12b-5862-404f-8943-2fbb35322e4e",
            eventName: zupass.eventName,
          },
          {
            pcdType: zupass.pcdType,
            publicKey: zupass.publicKey as EdDSAPublicKey,
            eventId,
            productId: "c751e137-bb3c-44f3-94c2-f81f0bc00276",
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
  }, [signer, smartAccountClient, storeZupassProof]);

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
        {isLoading ? (
          <Spinner className="mr-2 h-4 w-4" />
        ) : (
          <Button
            className="mb-4 sm:mb-0"
            variant={isRegistered === undefined ? "disabled" : "primary"}
            onClick={handleSignup}
          >
            Sign up to vote
          </Button>
        )}
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
