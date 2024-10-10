import { useMemo, useCallback, useState, useEffect } from "react";
import { FiAlertCircle } from "react-icons/fi";

import { StatusBar } from "~/components/StatusBar";
import { Button } from "~/components/ui/Button";
import { Spinner } from "~/components/ui/Spinner";
import { useIsAdmin } from "~/hooks/useIsAdmin";
import { useIsCorrectNetwork } from "~/hooks/useIsCorrectNetwork";
import { fetchApprovedApplications } from "~/utils/fetchAttestationsWithoutCache";

import type { Attestation } from "~/utils/types";

import { useApproveApplication } from "../hooks/useApproveApplication";
import { useApprovedApplications } from "../hooks/useApprovedApplications";

interface IReviewBarProps {
  roundId: string;
  projectId: string;
}

export const ReviewBar = ({ roundId, projectId }: IReviewBarProps): JSX.Element => {
  const isAdmin = useIsAdmin();
  const { isCorrectNetwork, correctNetwork } = useIsCorrectNetwork();

  const rawReturn = useApprovedApplications(roundId, [projectId]);
  const [refetchedData, setRefetchedData] = useState<Attestation[]>();

  const approved = useMemo(
    () => (rawReturn.data && rawReturn.data.length > 0) || (refetchedData && refetchedData.length > 0),
    [rawReturn.data, refetchedData],
  );

  const approve = useApproveApplication({ roundId });

  const onClick = useCallback(() => {
    approve.mutate([projectId]);
  }, [approve, projectId]);

  useEffect(() => {
    const fetchData = async () => {
      const ret = await fetchApprovedApplications(roundId, [projectId]);
      setRefetchedData(ret);
    };

    /// delay refetch data for 5 seconds
    const timeout = setTimeout(() => {
      fetchData();
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [approve.isPending, approve.isSuccess, projectId]);

  return (
    <div className="mb-4 w-full">
      {approved && <StatusBar content="The project has been approved." status="approved" />}

      {!approved && isAdmin && <StatusBar content="This project is pending approval." status="pending" />}

      {!approved && !isAdmin && (
        <StatusBar
          content={
            <div className="flex items-center gap-2">
              <FiAlertCircle className="h-4 w-4" />

              <span>This project is under review by our team.</span>

              <i>Applications can be edited and approved until the Application period ends.</i>
            </div>
          }
          status="default"
        />
      )}

      {isAdmin && !approved && (
        <div className="my-3 flex justify-end gap-2">
          <Button suppressHydrationWarning disabled={!isCorrectNetwork} size="auto" variant="primary" onClick={onClick}>
            {approve.isPending && <Spinner className="mr-2 h-4 w-4" />}

            {!approve.isPending && !isCorrectNetwork ? `Connect to ${correctNetwork.name}` : "Approve application"}
          </Button>
        </div>
      )}
    </div>
  );
};
