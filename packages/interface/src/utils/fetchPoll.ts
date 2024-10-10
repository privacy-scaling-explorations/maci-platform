import { BigNumberish } from "ethers";

import { config } from "~/config";

import type { IPollData } from "./types";
import type { Hex } from "viem";

import { createCachedFetch } from "./fetch";

const cachedFetch = createCachedFetch({ ttl: 1000 * 60 * 10 });

interface IRegistry {
  id: Hex;
  metadataUrl: string;
}

interface IPoll {
  pollId: string;
  createdAt: string;
  duration: string;
  stateRoot: string;
  messageRoot: string;
  numSignups: string;
  id: string;
  mode: string;
  registry: IRegistry;
  initTime: BigNumberish;
}

export interface GraphQLResponse {
  data?: {
    polls: IPoll[];
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
    }
  }
`;

function mappedPollData(polls: IPoll[]): IPollData[] {
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
  }));
}

export async function fetchPolls(): Promise<IPollData[] | undefined> {
  const polls = await cachedFetch<{ polls: IPoll[] }>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: PollQuery,
    }),
  }).then((response: GraphQLResponse) => response.data?.polls);

  // cast this to a IPollData object array so that we can deal with one object only in MACIContext
  return polls ? mappedPollData(polls) : undefined;
}
