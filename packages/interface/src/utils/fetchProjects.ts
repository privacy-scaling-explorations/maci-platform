import { config } from "~/config";
import { Metadata } from "~/features/proposals/types";

import { createCachedFetch } from "./fetch";
import { fetchMetadata } from "./fetchMetadata";
import { IRecipient } from "./types";

const cachedFetch = createCachedFetch({ ttl: 1000 });

export interface GraphQLResponse {
  data?: {
    recipients: IRecipient[];
  };
}

// Query to fetch all approved projects
const ApprovedProjects = `
  query Recipients($registryAddress: String) {
    recipients(where:{ deleted:false, initialized: true, registry: $registryAddress }) {
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

// Query to fetch all projects, no matter approved or not
const Projects = `
  query Recipients($registryAddress: String) {
    recipients(where:{ deleted:false, registry: $registryAddress }) {
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

// Query to fetch project by payout address
const ProjectsByAddress = `
  query ProjectsByAddress($registryAddress: String!, $address: String!) {
    recipients(where: { registry: $registryAddress, payout: $address  }) {
      id
      metadataUrl
      index
      initialized
      payout
      registry {
        id
      }
    }
  }
`;

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

/**
 * Fetch all approved projects with metadata
 * @param search
 * @param registryAddress
 * @returns the projects with metadata values filtered by the search term
 */
export async function fetchApprovedProjectsWithMetadata(
  search: string,
  registryAddress: string,
): Promise<(IRecipient | null)[]> {
  const response = await cachedFetch<{ recipients: IRecipient[] }>(config.maciSubgraphUrl, {
    method: "POST",
    body: JSON.stringify({
      query: ApprovedProjects,
      variables: { registryAddress },
    }),
  }).then((resp: GraphQLResponse) => resp.data?.recipients);

  if (!response) {
    return [];
  }

  const recipients = await Promise.all(
    response.map(async (request) => {
      const metadata = (await fetchMetadata(request.metadataUrl)) as unknown as Metadata;
      const name = metadata.name.toLowerCase();
      if (search !== "" && !name.includes(search.trim().toLowerCase())) {
        return null;
      }
      return {
        id: request.id,
        metadataUrl: request.metadataUrl,
        metadata,
        payout: request.payout,
        initialized: request.initialized,
        index: request.index,
      };
    }),
  );

  return recipients.filter((r) => r !== null);
}

/**
 * Fetch  projects of a specific payout address
 * @param registryAddress
 * @param address
 * @return only the projects with a specific payout address
 */
export async function fetchProjectsByAddress(registryAddress: string, address: string): Promise<IRecipient[]> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: ProjectsByAddress,
      variables: { registryAddress, address },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;

  if (!result.data) {
    throw new Error("No data returned from GraphQL query");
  }

  return result.data.recipients;
}
