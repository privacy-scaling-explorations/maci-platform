import "@testing-library/jest-dom";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { createTRPCMsw } from "msw-trpc";
import superjson from "superjson";

import { type AppRouter } from "./server/api/root";

export const mockTrpc = createTRPCMsw<AppRouter>({
  baseUrl: "http://localhost:3000/api/trpc",
  transformer: {
    input: superjson,
    output: superjson,
  },
});

export const server = setupServer(
  http.get("/api/auth/session", () => HttpResponse.json({})),
  // mockTrpc.projects.search.query(() => {
  //   return mockProjects;
  // }),
  // mockTrpc.projects.get.query(({ id }) => {
  //   return mockProjects.find((p) => p.id === id);
  // }),
  // mockTrpc.metadata.get.query((params) => {
  //   console.log(params);
  //   return {};
  // }),
  // mockTrpc.projects.count.query(() => {
  //   return { count: 9999 };
  // }),
);
