import { useSession } from "next-auth/react";
import { useState, useCallback, useMemo } from "react";

import { MaciService } from "~/services/maci";
import { useEthersSigner } from "./useEthersSigner";
import { eas } from "~/config";
import * as vks from "../../public/vk_10-2-1-2_test.0.json";

interface IDeployArgs {
  amount: number;
}

export function useDeployment() {
  /**
   * deployStatus:
   * 0. default
   * 1. VoiceCreditProxy
   * 2. Gatekeeper
   * 3. Verifier
   * 4. PollFactory
   * 5. MessageProcessorFactory
   * 6. TallyFactory
   * 7. MACI contract
   * 8. VkRegistry
   */
  const [deployStatus, setDeployStatus] = useState<number>(0);
  const signer = useEthersSigner();
  const { data } = useSession();

  const maci = useMemo(
    () => (signer ? new MaciService(signer) : undefined),
    [Boolean(signer), useEthersSigner],
  );

  const deploy = useCallback(
    async ({ amount }: IDeployArgs) => {
      if (!signer || !maci) throw new Error("no signer");

      const attester = await signer.getAddress();

      // 1. deploy voice credit proxy contract
      setDeployStatus(1);
      await maci.deployInitialVoiceCreditProxy({ amount });

      // 2. deploy EASGatekeeper contract
      setDeployStatus(2);
      await maci.deployGatekeeper({
        easAddress: eas.contracts.eas,
        encodedSchema: eas.schemas.approval,
        attester,
      });

      // 3. deploy verifier contract
      setDeployStatus(3);
      await maci.deployVerifier();

      // 4. deploy PollFactory contract
      setDeployStatus(4);
      await maci.deployPollFactory();

      // 5. deploy MessageProcessorFactory contract
      setDeployStatus(5);
      await maci.deployMessageProcessorFactory();

      // 6. deploy TallyFactory contract
      setDeployStatus(6);
      await maci.deployTallyFactory();

      // 7. deploy MACI contract
      setDeployStatus(7);
      await maci.deployMaci();

      // 8. deploy VkRegistry contract
      setDeployStatus(8);
      await maci.deployVkRegistry({
        processMessagesZkeyQv: vks.processVkQv,
        processMessagesZkeyNonQv: vks.processVkNonQv,
        tallyVotesZkeyQv: vks.tallyVkQv,
        tallyVotesZkeyNonQv: vks.tallyVkNonQv,
      });
    },
    [deployStatus, setDeployStatus, Boolean(signer), Boolean(maci)],
  );

  const deployPoll = useCallback(async () => {
    if (!signer || !maci) throw new Error("no signer");

    if (!data) throw new Error("maci keypair not generated");

    await maci.deployPoll({ duration: 100000, pubKey: data.publicKey });
  }, [deployStatus, setDeployStatus, Boolean(signer), Boolean(maci), data]);

  return {
    deployStatus,
    deploy,
    deployPoll,
  };
}
