import { z } from "zod";

import { config, eas } from "~/config";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchPendingApplications } from "~/utils/fetchApplications";
import { fetchAttestations } from "~/utils/fetchAttestations";
import { createDataFilter } from "~/utils/fetchAttestationsUtils";

export const applicationsRouter = createTRPCRouter({
  approvals: publicProcedure.input(z.object({ ids: z.array(z.string()).optional() })).query(async ({ input }) =>
    fetchAttestations([eas.schemas.approval], {
      where: {
        attester: { equals: config.admin },
        refUID: input.ids ? { in: input.ids } : undefined,
        AND: [createDataFilter("type", "bytes32", "application"), createDataFilter("round", "bytes32", config.roundId)],
      },
    }),
  ),
  list: publicProcedure.input(z.object({ registryAddress: z.string() })).query(async ({ input }) =>
    fetchPendingApplications(input.registryAddress),
  ),
});
