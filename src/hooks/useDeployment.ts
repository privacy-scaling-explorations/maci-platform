import { useState, useCallback, useMemo } from "react";

import { MaciService } from "~/services";
import { useEthersSigner } from "./useEthersSigner";
import { eas, config } from "~/config";
import { useMaci } from "~/contexts/Maci";

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
  const { maciPubKey } = useMaci();

  const maci = useMemo(
    () => (signer ? new MaciService(signer) : undefined),
    [Boolean(signer), useEthersSigner],
  );

  const deploy = useCallback(
    async ({ amount }: IDeployArgs) => {
      if (!signer || !maci || !maciPubKey) throw new Error("no signer");

      const attester = await signer.getAddress();

      try {
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
        await maci.deployVerifier({});

        // 4. deploy PollFactory contract
        setDeployStatus(4);
        await maci.deployPollFactory({});

        // 5. deploy MessageProcessorFactory contract
        setDeployStatus(5);
        await maci.deployMessageProcessorFactory({});

        // 6. deploy TallyFactory contract
        setDeployStatus(6);
        await maci.deployTallyFactory({});

        // 7. deploy MACI contract
        setDeployStatus(7);
        await maci.deployMaci({});

        // 8. deploy VkRegistry contract
        setDeployStatus(8);

        const vks = await fetch(config.vkeyFilePath).then((res) => res.json());

        await maci.deployVkRegistry({
          processMessagesZkeyQv: vks.processVkQv,
          processMessagesZkeyNonQv: vks.processVkNonQv,
          tallyVotesZkeyQv: vks.tallyVkQv,
          tallyVotesZkeyNonQv: vks.tallyVkNonQv,
        });
      } catch (e) {
        throw new Error(`Error during deployment: ${e}`);
      } finally {
        // TODO: this is temporal
        console.log("Deployment completed.");
      }
    },
    [deployStatus, setDeployStatus, Boolean(signer), Boolean(maci)],
  );

  const deployPoll = useCallback(async () => {
    if (!signer || !maci) throw new Error("no signer");

    await maci.deployPoll({ duration: 100, pubKey: maciPubKey });
  }, [deployStatus, setDeployStatus, Boolean(signer), Boolean(maci)]);

  return {
    deployStatus,
    deploy,
    deployPoll,
  };
}
