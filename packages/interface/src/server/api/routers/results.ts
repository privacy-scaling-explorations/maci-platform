import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchApprovedProjects } from "~/utils/fetchProjects";
import { fetchTally } from "~/utils/fetchTally";

import type { IRecipient } from "~/utils/types";

export const resultsRouter = createTRPCRouter({
  votes: publicProcedure
    .input(z.object({ registryAddress: z.string(), tallyAddress: z.string() }))
    .query(async ({ input }) => calculateMaciResults(input.registryAddress, input.tallyAddress)),

  project: publicProcedure
    .input(z.object({ id: z.string(), registryAddress: z.string(), tallyAddress: z.string() }))
    .query(async ({ input }) => {
      const { projects } = await calculateMaciResults(input.registryAddress, input.tallyAddress);

      return {
        amount: projects[input.id]?.votes ?? 0,
      };
    }),

  projects: publicProcedure
    .input(z.object({ registryAddress: z.string(), tallyAddress: z.string() }))
    .query(async ({ input }) => {
      const { projects: results } = await calculateMaciResults(input.registryAddress, input.tallyAddress);
      const projects = await fetchApprovedProjects(input.registryAddress);

      return mappedProjectsResults(results, projects);
    }),
});

/**
 * Calculate the results of the MACI tally
 *
 * @param registryAddress - The registry address
 * @param tallyAddress - The poll address
 * @returns The results of the tally
 */
export async function calculateMaciResults(
  registryAddress: string,
  tallyAddress: string,
): Promise<{
  averageVotes: number;
  projects: Record<string, { votes: number; voters: number }>;
}> {
  const [tallyData, projects] = await Promise.all([
    fetchTally(tallyAddress).catch(() => undefined),
    fetchApprovedProjects(registryAddress),
  ]);

  if (!tallyData) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "The data is not tallied yet",
    });
  }

  const results = tallyData.results.reduce((acc, tally, index) => {
    const project = projects[index];
    if (project) {
      acc.set(project.id, { votes: Number(tally.result), voters: 0 });
    }

    return acc;
  }, new Map<string, { votes: number; voters: number }>());

  const averageVotes = calculateAverage(Object.values(Object.fromEntries(results)).map(({ votes }) => votes));

  return {
    averageVotes,
    projects: Object.fromEntries(results),
  };
}

function mappedProjectsResults(results: Record<string, { votes: number; voters: number }>, projects: IRecipient[]) {
  const projectWithVotes = projects.map((project) => ({
    ...project,
    votes: results[project.id]?.votes ?? 0,
  }));
  return projectWithVotes.sort((a, b) => (a.votes > b.votes ? -1 : 1));
}

/**
 * Calculate the average of an array of numbers
 *
 * @param votes - An array of numbers
 * @returns The average of the array
 */
function calculateAverage(votes: number[]) {
  if (votes.length === 0) {
    return 0;
  }

  const sum = votes.reduce((acc, x) => acc + x, 0);

  const average = sum / votes.length;

  return Math.round(average);
}
