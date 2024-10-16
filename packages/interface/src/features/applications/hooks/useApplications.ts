import { api } from "~/utils/api";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { Attestation } from "~/utils/types";

export function useApplications(roundId: string): UseTRPCQueryResult<Attestation[], unknown> {
  return api.applications.list.useQuery({ roundId });
}
