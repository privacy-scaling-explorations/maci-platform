import { config } from "~/config";

import type { IPollData, Poll } from "./types";

import { createCachedFetch } from "./fetch";

const cachedFetch = createCachedFetch({ ttl: 1000 * 60 * 10 });

export interface GraphQLResponse {
  data?: {
    polls: Poll[];
  };
}

const PollQuery = `
  query Poll {
    polls(orderBy: createdAt, orderDirection: desc) {
      pollId
      duration
      createdAt
      stateRoot
      messageRoot
      numSignups
      id
      mode
      initTime
      registry {
        id
        metadataUrl
      }
      tally {
        id
      }
    }
  }
`;

/**
 * Maps the poll data to the IPollData interface
 *
 * @param polls - The poll data
 * @returns The mapped poll data
 */
function mappedPollData(polls: Poll[]): IPollData[] {
  return polls.map((poll) => ({
    isMerged: !!poll.messageRoot,
    id: poll.pollId,
    duration: poll.duration,
    deployTime: poll.createdAt,
    numSignups: poll.numSignups,
    address: poll.id,
    mode: poll.mode,
    registryAddress: poll.registry.id,
    metadataUrl: poll.registry.metadataUrl,
    initTime: poll.initTime,
    tallyAddress: poll.tally.id,
  }));
}

/**
 * Fetches the poll data from the subgraph
 *
 * @returns The poll data
 */
export async function fetchPolls(): Promise<IPollData[] | undefined> {
  const polls = await cachedFetch<{ polls: Poll[] }>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: PollQuery,
    }),
  }).then((response: GraphQLResponse) => response.data?.polls);

  // cast this to a IPollData object array so that we can deal with one object only in MACIContext
  return polls ? mappedPollData(polls) : undefined;
}
