import { config } from "~/config";

import type { Tally } from "./types";

import { createCachedFetch } from "./fetch";

const cachedFetch = createCachedFetch({ ttl: 1000 * 60 * 10 });

export interface GraphQLResponse {
  data?: {
    tally: Tally;
  };
}

const tallyQuery = `
  query Tally {
    tally(id: $id) {
      id
      results {
        id
        result
      }
    }
  }
`;

/**
 * Fetches the tally data from the subgraph
 *
 * @returns The tally data
 */
export async function fetchTally(id: string): Promise<Tally | undefined> {
  return cachedFetch<{ tally: Tally }>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: tallyQuery.replace("id: $id", `id: "${id}"`),
    }),
  }).then((response: GraphQLResponse) => response.data?.tally);
}
