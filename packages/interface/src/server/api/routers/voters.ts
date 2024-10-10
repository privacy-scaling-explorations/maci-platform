import { z } from "zod";

import { eas } from "~/config";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchAttestations, fetchApprovedVoter, fetchApprovedVoterAttestations } from "~/utils/fetchAttestations";
import { createDataFilter } from "~/utils/fetchAttestationsUtils";

/// TODO: change to filter with event name instead of roundId
export const FilterSchema = z.object({
  limit: z.number().default(3 * 8),
  cursor: z.number().default(0),
});

export const votersRouter = createTRPCRouter({
  approved: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => fetchApprovedVoter(input.address)),

  approvedAttestations: publicProcedure
    .input(z.object({ address: z.string().default("") }))
    .query(async ({ input }) => fetchApprovedVoterAttestations(input.address)),

  list: publicProcedure.input(FilterSchema).query(async () =>
    fetchAttestations([eas.schemas.approval], {
      where: {
        AND: [createDataFilter("type", "bytes32", "voter")],
      },
    }),
  ),
});
