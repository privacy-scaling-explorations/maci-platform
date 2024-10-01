import { config } from "~/config";

import { createCachedFetch } from "./fetch";
import { IRecipient } from "./types";

const cachedFetch = createCachedFetch({ ttl: 1000 });

export interface GraphQLResponse {
  data?: {
    recipients: IRecipient[];
  };
}

// query to fetch all approved projects
const ApprovedProjects = `
  query Recipients($registryAddress: String) {
    recipients (where:{ deleted:false, initialized: true, registry: $registryAddress }) {
      id
      payout
      metadataUrl
      index
      initialized
      registry {
        id
      }
    }
  }`;

const Projects = `
  query Recipients($registryAddress: String) {
    recipients (where:{ deleted:false, registry: $registryAddress }) {
      id
      payout
      metadataUrl
      index
      initialized
      registry {
        id
      }
    }
  }`;

/**
 * Fetch all projects
 *
 * @returns the projects
 */
export async function fetchProjects(registryAddress: string): Promise<IRecipient[]> {
  const response = await cachedFetch<{ recipients: IRecipient[] }>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: Projects,
      variables: { registryAddress },
    }),
  }).then((resp: GraphQLResponse) => resp.data?.recipients);

  const recipients = response?.map((request) => ({
    id: request.id,
    metadataUrl: request.metadataUrl,
    payout: request.payout,
    initialized: request.initialized,
    index: request.index,
  }));

  return recipients ?? [];
}

/**
 * Fetch all approved projects
 *
 * @returns the projects
 */
export async function fetchApprovedProjects(registryAddress: string): Promise<IRecipient[]> {
  const response = await cachedFetch<{ recipients: IRecipient[] }>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: ApprovedProjects,
      variables: { registryAddress },
    }),
  }).then((resp: GraphQLResponse) => resp.data?.recipients);

  const recipients = response?.map((request) => ({
    id: request.id,
    metadataUrl: request.metadataUrl,
    payout: request.payout,
    initialized: request.initialized,
    index: request.index,
  }));

  return recipients ?? [];
}
