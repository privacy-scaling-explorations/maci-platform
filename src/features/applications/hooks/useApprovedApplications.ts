import { api } from "~/utils/api";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { Attestation } from "~/utils/fetchAttestations";

export function useApprovedApplications(ids?: string[]): UseTRPCQueryResult<Attestation[], unknown> {
  return api.applications.approvals.useQuery({ ids });
}
