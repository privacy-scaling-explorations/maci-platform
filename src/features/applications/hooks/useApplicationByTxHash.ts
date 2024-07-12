import { api } from "~/utils/api";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { Attestation } from "~/utils/fetchAttestations";

export function useApplicationByTxHash(transactionId: string): UseTRPCQueryResult<Attestation, unknown> {
  return api.projects.getByTransactionId.useQuery({ transactionId });
}
