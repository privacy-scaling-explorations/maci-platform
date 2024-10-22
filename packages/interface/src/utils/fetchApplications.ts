import { config } from "~/config";

import type { IRequest } from "./types";

export interface GraphQLResponse {
  data?: {
    requests: IRequest[];
  };
}

// Fetch only pending add requests
const PendingRequests = `
  query PendingAddRequests($registryAddress: String!) {
    requests(where: { requestType: "Add", status: "Pending", recipient_: { registry: $registryAddress } }) {
      index
      recipient {
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
  }
`;

// Fetch only rejected add requests
const RejectedRequests = `
  query RejectedRequests($registryAddress: String!) {
    requests(where: { status: "Rejected", requestType: "Add", recipient_: { registry: $registryAddress } }) {
      index
      recipient {
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
  }
`;

// Fetch only approved add requests
const ApprovedRequests = `
  query ApprovedRequests($registryAddress: String!) {
    requests(where: { status: "Approved", requestType: "Add", recipient_: { registry: $registryAddress } }) {
      index
      recipient {
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
  }
`;

const IndividualRequest = `
  query PendingAddRequests($registryAddress: String!, $recipientId: String!) {
    requests(where: { requestType: "Add", status: "Pending", recipient_: { 
        registry: $registryAddress,
        id: $recipientId
      }
    }) {
      index
      recipient {
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
  }
`;

const ApplicationById = `
  query ApplicationById($registryAddress: String!, $id: String!) {
    requests(where: { recipient_: { registry: $registryAddress }, id: $id, requestType: "Add"  }) {
      id
      index
      recipient {
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
  }
`;

/**
 * Fetch application by project ID
 *
 * @param projectId - the project ID
 * @param registryAddress - the registry ID
 */
export async function fetchApplicationByProjectId(projectId: string, registryAddress: string): Promise<IRequest> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: IndividualRequest,
      variables: { recipientId: projectId, registryAddress },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;

  if (!result.data || result.data.requests.length === 0) {
    throw new Error("No data returned from GraphQL query");
  }

  return result.data.requests[0]!;
}

/**
 * Fetch all pending applications
 *
 * @returns the pending add requests
 */
export async function fetchPendingApplications(registryAddress: string): Promise<IRequest[]> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: PendingRequests,
      variables: { registryAddress },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;

  if (!result.data) {
    throw new Error("No data returned from GraphQL query");
  }

  return result.data.requests;
}

/**
 * Fetch applications that have been rejected
 *
 * @param registryAddress - the registry ID to filter by
 * @returns the rejected add requests
 */
export async function fetchRejectedApplications(registryAddress: string): Promise<IRequest[]> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: RejectedRequests,
      variables: { registryAddress },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;

  if (!result.data) {
    throw new Error("No data returned from GraphQL query");
  }

  return result.data.requests;
}

/**
 * Fetch applications that have been approved
 *
 * @param registryAddress - the registry ID to filter by
 * @returns the approved add requests
 */
export async function fetchApprovedApplications(registryAddress: string): Promise<IRequest[]> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: ApprovedRequests,
      variables: { registryAddress },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;

  if (!result.data) {
    throw new Error("No data returned from GraphQL query");
  }

  return result.data.requests;
}

/**
 * Fetch all applications
 *
 * @param registryAddress - the registry ID to filter by
 * @returns the add requests
 */
export async function fetchApplications(registryAddress: string): Promise<IRequest[]> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: ApprovedRequests,
      variables: { registryAddress },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;

  if (!result.data) {
    throw new Error("No data returned from GraphQL query");
  }

  return result.data.requests;
}

/**
 * Fetch application by ID
 *
 * @param registryAddress - the registry ID
 * @param id - the application ID
 * @returns the application
 */
export async function fetchApplicationById(registryAddress: string, id: string): Promise<IRequest> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: ApplicationById,
      variables: { id, registryAddress },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;

  if (!result.data?.requests) {
    throw new Error("No application found with this ID");
  }

  return result.data.requests[0]!;
}
