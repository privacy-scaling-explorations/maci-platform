import { api } from "~/utils/api";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { Attestation } from "~/utils/types";

export function useApprovedApplications(roundId: string, ids?: string[]): UseTRPCQueryResult<Attestation[], unknown> {
  return api.applications.approvals.useQuery({ roundId, ids });
}
