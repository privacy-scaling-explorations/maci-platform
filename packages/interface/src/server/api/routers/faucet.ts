import { ZKEdDSAEventTicketPCDClaim } from "@pcd/zk-eddsa-event-ticket-pcd";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchFaucet } from "~/utils/fetchFaucet";

import type { PCD } from "@pcd/pcd-types";
import type { Groth16Proof } from "snarkjs";

const pcdSchema = z.object({
  id: z.string(),
  type: z.string(),
  claim: z.unknown(),
  proof: z.unknown(),
});

export const faucetRouter = createTRPCRouter({
  claimFunds: publicProcedure.input(z.object({ address: z.string(), pcd: pcdSchema })).query(async ({ input }) => {
    const pcd = input.pcd as unknown as PCD<ZKEdDSAEventTicketPCDClaim, Groth16Proof>;
    return fetchFaucet(input.address, pcd);
  }),
});
