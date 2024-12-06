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

const talliesQuery = `
  query Tally {
    tallies {
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
 * @param id the address of the tally contract
 * @returns The tally data
 */
export async function fetchTally(id: string): Promise<Tally | undefined> {
  return cachedFetch<{ tally: Tally }>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: tallyQuery.replace("id: $id", `id: "${id}"`),
    }),
  })
    .then((response: GraphQLResponse) => response.data?.tally)
    .catch(() => undefined);
}

/**
 * Fetches all the tallies from the subgraph
 *
 * @returns The on-chain tallies
 */
export async function fetchTallies(): Promise<Tally[] | undefined> {
  return cachedFetch<{ tallies: Tally[] }>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: talliesQuery,
    }),
  })
    .then((r) => r.data.tallies)
    .catch(() => []);
}
