import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  fetchApplicationById,
  fetchApplicationByProjectId,
  fetchApprovedApplications,
  fetchPendingApplications,
  fetchApplications,
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

  getByIds: publicProcedure
    .input(z.object({ registryAddress: z.string(), ids: z.array(z.string()) }))
    .query(async ({ input }) => {
      if (input.ids.length > 0) {
        return Promise.all(input.ids.map((id) => fetchApplicationById(input.registryAddress, id)));
      }
      return fetchApplications(input.registryAddress);
    }),

  getByProjectId: publicProcedure
    .input(z.object({ registryAddress: z.string(), projectId: z.string() }))
    .query(async ({ input }) => fetchApplicationByProjectId(input.projectId, input.registryAddress)),
});
