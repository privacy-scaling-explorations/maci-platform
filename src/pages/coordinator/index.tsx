import { useCallback, useMemo } from "react";
import { useSignMessage } from "wagmi";

import { Layout } from "~/layouts/DefaultLayout";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { useDeployment } from "~/hooks/useDeployment";
import { useEthersSigner } from "~/hooks/useEthersSigner";
import { MaciService } from "~/services";
import { useMaci } from "~/contexts/Maci";

export default function CoordinatorDashboard() {
  const isAdmin = useIsAdmin();
  const { deployStatus, deploy, deployPoll } = useDeployment();
  const signer = useEthersSigner();
  const maci = useMemo(() => signer && new MaciService(signer), [signer]);
  const { signMessageAsync } = useSignMessage();
  const { maciPrivKey } = useMaci();

  const handleDeploy = useCallback(() => deploy({ amount: 99 }), [deploy]);
  const handleDeployPoll = useCallback(() => deployPoll(), [deployPoll]);
  const handleGenProof = useCallback(async () => {
    const signature = await signMessageAsync({ message: "message" });
    await maci?.genProof({ signature, message: "message", maciPrivKey });
  }, [maci]);

  return (
    <Layout>
      {isAdmin && (
        <div>
          <button onClick={handleDeploy}>deploy contracts</button>
          <div>Deploy progress: {deployStatus}</div>
          <button onClick={handleDeployPoll}>deploy poll</button> <br />
          <button onClick={handleGenProof}>try gen proof</button>
        </div>
      )}
    </Layout>
  );
}
