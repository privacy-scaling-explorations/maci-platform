import { useCallback } from "react";

import { Layout } from "~/layouts/DefaultLayout";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { useDeployment } from "~/hooks/useDeployment";


export default function CoodirnatorDashboard() { 
    const isAdmin = useIsAdmin();
    const { deployStatus, deploy, deployPoll } = useDeployment();

    const handleDeploy = useCallback(() => deploy({ amount: 99 }), [deploy]);
    const handleDeployPoll = useCallback(() => deployPoll(), [deployPoll]);

    return (
        <Layout>
            { isAdmin && 
                <div>
                    <button onClick={handleDeploy}>deploy contracts</button>
                    <div>Deploy progress: {deployStatus}</div>
                    <button onClick={handleDeployPoll}>deploy poll</button>
                </div>
            }
        </Layout>
    );
}