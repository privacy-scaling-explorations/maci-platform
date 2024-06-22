import { type UseTRPCQueryResult } from "@trpc/react-query/shared";
import { type Address } from "viem";

import { api } from "~/utils/api";

export function useApprovedVoter(address: Address): UseTRPCQueryResult<boolean | number, unknown> {
  return api.voters.approved.useQuery({ address });
}
