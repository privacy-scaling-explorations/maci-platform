import { applicationsRouter } from "~/server/api/routers/applications";
import { maciRouter } from "~/server/api/routers/maci";
import { metadataRouter } from "~/server/api/routers/metadata";
import { projectsRouter } from "~/server/api/routers/projects";
import { resultsRouter } from "~/server/api/routers/results";
import { votersRouter } from "~/server/api/routers/voters";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  results: resultsRouter,
  voters: votersRouter,
  applications: applicationsRouter,
  metadata: metadataRouter,
  projects: projectsRouter,
  maci: maciRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
