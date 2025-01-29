import { config } from "~/config";

import type { IRequest } from "./types";

export interface GraphQLResponse {
  data?: {
    requests: IRequest[];
  };
}

// Query to fetch only pending add requests
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

// Query to fetch only rejected add requests
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

// Query to fetch only approved add requests
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

// Query to fetch all add requests
const AddRequests = `
  query AddRequests($registryAddress: String!) {
    requests(where: { requestType: "Add", recipient_: { registry: $registryAddress } }) {
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

// Query to fetch request by project id
const RequestByProjectId = `
  query RequestByProjectId($registryAddress: String!, $recipientId: String!) {
    requests(where: { requestType: "Add", recipient_: { 
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

// Query to fetch request by request id
const RequestById = `
  query RequestById($registryAddress: String!, $id: String!) {
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
 * Fetch request by project ID
 *
 * @param projectId - the project ID
 * @param registryAddress - the registry ID
 */
export async function fetchRequestByProjectId(projectId: string, registryAddress: string): Promise<IRequest> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: RequestByProjectId,
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
 * Fetch all pending requests
 *
 * @returns the pending add requests
 */
export async function fetchPendingRequests(registryAddress: string): Promise<IRequest[]> {
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
 * Fetch requests that have been rejected
 *
 * @param registryAddress - the registry ID to filter by
 * @returns the rejected add requests
 */
export async function fetchRejectedRequests(registryAddress: string): Promise<IRequest[]> {
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
 * Fetch requests that have been approved
 *
 * @param registryAddress - the registry ID to filter by
 * @returns the approved add requests
 */
export async function fetchApprovedRequests(registryAddress: string): Promise<IRequest[]> {
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
 * Fetch all add requests
 *
 * @param registryAddress - the registry ID to filter by
 * @returns the add requests
 */
export async function fetchAllAddRequests(registryAddress: string): Promise<IRequest[]> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: AddRequests,
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
 * Fetch request by ID
 *
 * @param registryAddress - the registry ID
 * @param id - the request ID
 * @returns the request
 */
export async function fetchRequestById(registryAddress: string, id: string): Promise<IRequest> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: RequestById,
      variables: { id, registryAddress },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;

  if (!result.data?.requests) {
    throw new Error("No request found with this ID");
  }

  return result.data.requests[0]!;
}
