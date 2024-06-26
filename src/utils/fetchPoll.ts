import { IGetPollData } from "maci-cli/sdk";

import { config } from "~/config";

import { createCachedFetch } from "./fetch";

const cachedFetch = createCachedFetch({ ttl: 1000 * 60 * 10 });

interface Poll {
  pollId: string;
  createdAt: string;
  duration: string;
  stateRoot: string;
  messageRoot: string;
  numSignups: string;
  id: string;
}

export interface GraphQLResponse {
  data?: {
    polls: Poll[];
  };
}

const PollQuery = `
  query Poll {
    polls(orderBy: createdAt, orderDirection: desc, first: 1) {
      pollId
      duration
      createdAt
      stateRoot
      messageRoot
      numSignups
      id
    }
  }
`;

export async function fetchPoll(): Promise<IGetPollData> {
  const poll = (
    await cachedFetch<{ polls: Poll[] }>(config.maciSubgraphUrl, {
      method: "POST",
      body: JSON.stringify({
        query: PollQuery,
      }),
    }).then((response: GraphQLResponse) => response.data?.polls)
  )?.at(0);

  // cast this to a IGetPollData object so that we can deal with one object only in MACIContext
  return {
    isStateAqMerged: !!poll?.messageRoot,
    id: poll?.pollId ?? 0,
    duration: poll?.duration ?? 0,
    deployTime: poll?.createdAt ?? 0,
    numSignups: poll?.numSignups ?? 0,
    address: poll?.id ?? "",
  };
}
