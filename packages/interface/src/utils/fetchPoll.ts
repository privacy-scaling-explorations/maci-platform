import { BigNumberish } from "ethers";
import { IGetPollData } from "maci-cli/sdk";
import { type Hex, zeroAddress } from "viem";

import { config } from "~/config";

import type { Poll } from "./types";

import { createCachedFetch } from "./fetch";

const cachedFetch = createCachedFetch({ ttl: 1000 * 60 * 10 });

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
      mode
      initTime
      registry {
        id
      }
    }
  }
`;

export interface IPollData extends IGetPollData {
  registry: Hex;
  initTime: BigNumberish;
}

/**
 * Fetches the poll data from the subgraph
 *
 * @returns The poll data
 */
export async function fetchPoll(): Promise<IPollData> {
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
    isMerged: !!poll?.messageRoot,
    id: poll?.pollId ?? 0,
    duration: poll?.duration ?? 0,
    deployTime: poll?.createdAt ?? 0,
    numSignups: poll?.numSignups ?? 0,
    address: poll?.id ?? "",
    mode: poll?.mode ?? "",
    initTime: poll?.initTime ?? 0,
    registry: poll?.registry ? (poll.registry.id as Hex) : zeroAddress,
  };
}
