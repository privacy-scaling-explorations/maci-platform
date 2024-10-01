import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { FilterSchema } from "~/features/filter/types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchApprovedProjects, fetchProjects } from "~/utils/fetchProjects";
import { getProjectCount } from "~/utils/registry";

import type { Chain, Hex } from "viem";

export const projectsRouter = createTRPCRouter({
  count: publicProcedure
    .input(z.object({ chain: z.custom<Chain>(), registryAddress: z.string() }))
    .query(async ({ input }) =>
      getProjectCount(input.chain, input.registryAddress as Hex).then((count) => ({
        count,
      })),
    ),

  get: publicProcedure
    .input(z.object({ ids: z.array(z.string()), registryAddress: z.string() }))
    .query(async ({ input: { ids, registryAddress } }) => {
      if (!ids.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const projects = await fetchProjects(registryAddress);

      return projects.find((project) => ids.includes(project.id));
    }),

  search: publicProcedure
    .input(FilterSchema.extend({ search: z.string(), registryAddress: z.string() }))
    .query(async ({ input }) =>
      // get the projects that are approved
      fetchApprovedProjects(input.registryAddress),
    ),
});
