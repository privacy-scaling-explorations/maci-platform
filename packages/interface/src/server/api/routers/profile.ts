import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { eas } from "~/config";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchAttestations } from "~/utils/fetchAttestations";
import { createDataFilter } from "~/utils/fetchAttestationsUtils";

export const profileRouter = createTRPCRouter({
  get: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) =>
    fetchAttestations([eas.schemas.metadata], {
      where: {
        recipient: { in: [input.id] },
        ...createDataFilter("type", "bytes32", "profile"),
      },
    }).then(([attestation]) => {
      if (!attestation) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return attestation;
    }),
  ),
});
