import { useMemo } from "react";
import { FiAlertCircle } from "react-icons/fi";

import { StatusBar } from "~/components/StatusBar";
import { useIsAdmin } from "~/hooks/useIsAdmin";

import { useApprovedApplications } from "../hooks/useApprovedApplications";

import { AdminButtonsBar } from "./AdminButtonsBar";

interface IReviewBarProps {
  projectId: string;
}

export const ReviewBar = ({ projectId }: IReviewBarProps): JSX.Element => {
  const isAdmin = useIsAdmin();
  const rawReturn = useApprovedApplications([projectId]);

  const approved = useMemo(() => rawReturn.data && rawReturn.data.length > 0, [rawReturn]);

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

              <i>Applications can be edited and approved until Registration period ends.</i>
            </div>
          }
          status="default"
        />
      )}

      {isAdmin && !approved && <AdminButtonsBar projectId={projectId} />}
    </div>
  );
};
