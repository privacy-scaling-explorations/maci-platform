import { TRPCError } from "@trpc/server";
import { type TallyData } from "maci-cli/sdk";
import { z } from "zod";

import { eas } from "~/config";
import { FilterSchema } from "~/features/filter/types";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchAttestations } from "~/utils/fetchAttestations";

import { getAllApprovedProjects } from "./projects";

export const resultsRouter = createTRPCRouter({
  votes: publicProcedure
    .input(z.object({ roundId: z.string(), tallyFile: z.string().optional() }))
    .query(async ({ input }) => calculateMaciResults(input.roundId, input.tallyFile)),

  project: publicProcedure
    .input(z.object({ id: z.string(), roundId: z.string(), tallyFile: z.string().optional() }))
    .query(async ({ input }) => {
      const { projects } = await calculateMaciResults(input.roundId, input.tallyFile);

      return {
        amount: projects[input.id]?.votes ?? 0,
      };
    }),

  projects: publicProcedure
    .input(FilterSchema.extend({ roundId: z.string(), tallyFile: z.string().optional() }))
    .query(async ({ input }) => {
      const { projects } = await calculateMaciResults(input.roundId, input.tallyFile);

      const sortedIDs = Object.entries(projects)
        .sort((a, b) => b[1].votes - a[1].votes)
        .map(([id]) => id)
        .slice(input.cursor * input.limit, input.cursor * input.limit + input.limit);

      return fetchAttestations([eas.schemas.metadata], {
        where: {
          id: { in: sortedIDs },
        },
      }).then((attestations) =>
        // Results aren't returned from EAS in the same order as the `where: { in: sortedIDs }`
        // Sort the attestations based on the sorted array
        attestations.sort((a, b) => sortedIDs.indexOf(a.id) - sortedIDs.indexOf(b.id)),
      );
    }),
});

export async function calculateMaciResults(
  roundId: string,
  tallyFile?: string,
): Promise<{
  averageVotes: number;
  projects: Record<string, { votes: number; voters: number }>;
}> {
  if (!tallyFile) {
    throw new Error("No tallyFile URL provided.");
  }

  const [tallyData, projects] = await Promise.all([
    fetch(tallyFile)
      .then((res) => res.json() as Promise<TallyData>)
      .catch(() => undefined),
    getAllApprovedProjects({ roundId }),
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

function calculateAverage(votes: number[]) {
  if (votes.length === 0) {
    return 0;
  }

  const sum = votes.reduce((acc, x) => acc + x, 0);

  const average = sum / votes.length;

  return Math.round(average);
}
