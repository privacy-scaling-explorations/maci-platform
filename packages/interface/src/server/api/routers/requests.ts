import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  fetchRequestByIndex,
  fetchRequestByProjectId,
  fetchApprovedRequests,
  fetchPendingRequests,
  fetchChangeRequestByRecipientIndex,
} from "~/utils/fetchRequests";

export const requestsRouter = createTRPCRouter({
  approvals: publicProcedure
    .input(z.object({ registryAddress: z.string() }))
    .query(async ({ input }) => fetchApprovedRequests(input.registryAddress)),

  pending: publicProcedure
    .input(z.object({ registryAddress: z.string() }))
    .query(async ({ input }) => fetchPendingRequests(input.registryAddress)),

  getByIndex: publicProcedure
    .input(z.object({ registryAddress: z.string(), index: z.string() }))
    .query(async ({ input }) => fetchRequestByIndex(input.registryAddress, input.index)),

  getByProjectId: publicProcedure
    .input(z.object({ registryAddress: z.string(), projectId: z.string() }))
    .query(async ({ input }) => fetchRequestByProjectId(input.projectId, input.registryAddress)),

  getEditionByRecipientIndex: publicProcedure
    .input(z.object({ registryAddress: z.string(), recipientIndex: z.string() }))
    .query(async ({ input }) => fetchChangeRequestByRecipientIndex(input.registryAddress, input.recipientIndex)),
});
