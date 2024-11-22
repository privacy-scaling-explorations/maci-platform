import { ZKEdDSAEventTicketPCDClaim } from "@pcd/zk-eddsa-event-ticket-pcd";

import { api } from "~/utils/api";

import type { PCD } from "@pcd/pcd-types";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { Groth16Proof } from "snarkjs";
import type { IFetchFaucetReturn } from "~/utils/types";

export function useClaimFunds(
  address: string,
  pcd: PCD<ZKEdDSAEventTicketPCDClaim, Groth16Proof>,
): UseTRPCQueryResult<IFetchFaucetReturn, unknown> {
  return api.faucet.claimFunds.useQuery({ address, pcd });
}
