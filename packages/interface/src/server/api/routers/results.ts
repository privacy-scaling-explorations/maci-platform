import { TRPCError } from "@trpc/server";
import { type TallyData } from "maci-cli/sdk";
import { z } from "zod";

import { config } from "~/config";
import { FilterSchema } from "~/features/filter/types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchApprovedProjects, fetchProjects } from "~/utils/fetchProjects";

export const resultsRouter = createTRPCRouter({
  votes: publicProcedure
    .input(z.object({ pollId: z.string().nullish(), registryAddress: z.string() }))
    .query(async ({ input }) => calculateMaciResults(input.registryAddress, input.pollId)),

  project: publicProcedure
    .input(z.object({ id: z.string(), pollId: z.string().nullish(), registryAddress: z.string() }))
    .query(async ({ input }) => {
      const { projects } = await calculateMaciResults(input.registryAddress, input.pollId);

      return {
        amount: projects[input.id]?.votes ?? 0,
      };
    }),

  projects: publicProcedure
    .input(FilterSchema.extend({ pollId: z.string().nullish(), registryAddress: z.string() }))
    .query(async ({ input }) => fetchProjects(input.registryAddress)),
});

export async function calculateMaciResults(
  registryAddress: string,
  pollId?: string | null,
): Promise<{
  averageVotes: number;
  projects: Record<string, { votes: number; voters: number }>;
}> {
  if (!pollId) {
    throw new Error("No pollId provided.");
  }

  const [tallyData, projects] = await Promise.all([
    fetch(`${config.tallyUrl}/tally-${pollId}.json`)
      .then((res) => res.json() as Promise<TallyData>)
      .catch(() => undefined),
    fetchApprovedProjects(registryAddress),
  ]);

  if (!tallyData) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Voting has not ended yet",
    });
  }

  const results = tallyData.results.tally.reduce((acc, tally, index) => {
    const project = projects[index];
    if (project) {
      acc.set(project.id, { votes: Number(tally), voters: 0 });
    }

    return acc;
  }, new Map<string, { votes: number; voters: number }>());

  const averageVotes = calculateAverage(Object.values(Object.fromEntries(results)).map(({ votes }) => votes));

  return {
    averageVotes,
    projects: Object.fromEntries(results),
  };
}

/**
 * Calculate the average of an array of numbers
 *
 * @param votes - An array of numbers
 * @returns The average of the array
 */
function calculateAverage(votes: number[]): number {
  if (votes.length === 0) {
    return 0;
  }

  const sum = votes.reduce((acc, x) => acc + x, 0);

  const average = sum / votes.length;

  return Math.round(average);
}
