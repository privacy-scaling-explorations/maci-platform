import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  fetchApplicationById,
  fetchApplicationByProjectId,
  fetchApprovedApplications,
  fetchPendingApplications,
} from "~/utils/fetchApplications";

export const applicationsRouter = createTRPCRouter({
  approvals: publicProcedure
    .input(z.object({ registryAddress: z.string() }))
    .query(async ({ input }) => fetchApprovedApplications(input.registryAddress)),
  pending: publicProcedure
    .input(z.object({ registryAddress: z.string() }))
    .query(async ({ input }) => fetchPendingApplications(input.registryAddress)),
  getById: publicProcedure
    .input(z.object({ registryAddress: z.string(), id: z.string() }))
    .query(async ({ input }) => fetchApplicationById(input.registryAddress, input.id)),
  getByProjectId: publicProcedure
    .input(z.object({ registryAddress: z.string(), projectId: z.string() }))
    .query(async ({ input }) => fetchApplicationByProjectId(input.projectId, input.registryAddress)),
});
