import { z } from "zod";

import { config, eas } from "~/config";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchAttestations } from "~/utils/fetchAttestations";
import { createDataFilter } from "~/utils/fetchAttestationsUtils";

export const FilterSchema = z.object({
  limit: z.number().default(3 * 8),
  cursor: z.number().default(0),
  roundId: z.string(),
});

export const applicationsRouter = createTRPCRouter({
  approvals: publicProcedure
    .input(z.object({ ids: z.array(z.string()).optional(), roundId: z.string() }))
    .query(async ({ input }) =>
      fetchAttestations([eas.schemas.approval], {
        where: {
          attester: { equals: config.admin },
          refUID: input.ids ? { in: input.ids } : undefined,
          AND: [
            createDataFilter("type", "bytes32", "application"),
            createDataFilter("round", "bytes32", input.roundId),
          ],
        },
      }),
    ),
  list: publicProcedure.input(FilterSchema).query(async ({ input }) =>
    fetchAttestations([eas.schemas.metadata], {
      orderBy: [{ time: "desc" }],
      where: {
        AND: [createDataFilter("type", "bytes32", "application"), createDataFilter("round", "bytes32", input.roundId)],
      },
    }),
  ),
});
