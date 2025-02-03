import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  fetchRequestById,
  fetchRequestByProjectId,
  fetchApprovedRequests,
  fetchPendingRequests,
} from "~/utils/fetchRequests";

export const requestsRouter = createTRPCRouter({
  approvals: publicProcedure
    .input(z.object({ registryAddress: z.string() }))
    .query(async ({ input }) => fetchApprovedRequests(input.registryAddress)),

  pending: publicProcedure
    .input(z.object({ registryAddress: z.string() }))
    .query(async ({ input }) => fetchPendingRequests(input.registryAddress)),

  getById: publicProcedure
    .input(z.object({ registryAddress: z.string(), id: z.string() }))
    .query(async ({ input }) => fetchRequestById(input.registryAddress, input.id)),

  getByProjectId: publicProcedure
    .input(z.object({ registryAddress: z.string(), projectId: z.string() }))
    .query(async ({ input }) => fetchRequestByProjectId(input.projectId, input.registryAddress)),
});
