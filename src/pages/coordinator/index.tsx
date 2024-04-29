import { useCallback } from "react";

import { Layout } from "~/layouts/DefaultLayout";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { useDeployment } from "~/hooks/useDeployment";


export default function CoodirnatorDashboard() { 
    const isAdmin = useIsAdmin();
    const { deployStatus, deploy } = useDeployment();

    const handleDeploy = useCallback(() => deploy({ amount: 99 }), [deploy]);

    return (
        <Layout>
            { isAdmin && 
                <div>
                    <button onClick={handleDeploy}>deploy contracts</button>
                    <div>Deploy progress: {deployStatus}</div>
                </div>
            }
        </Layout>
    );
}