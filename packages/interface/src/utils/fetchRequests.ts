import { config } from "~/config";

import type { IRequest } from "./types";

export interface GraphQLResponse {
  data?: {
    requests: IRequest[];
  };
}

// Query to fetch only pending requests
const PendingRequests = `
  query PendingAddRequests($registryAddress: String!) {
    requests(where: { status: "Pending", recipient_: { registry: $registryAddress } }) {
      index
      requestType
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

// Query to fetch only rejected requests
const RejectedRequests = `
  query RejectedRequests($registryAddress: String!) {
    requests(where: { status: "Rejected", recipient_: { registry: $registryAddress } }) {
      index
      requestType
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
    requests(where: { status: "Approved", recipient_: { registry: $registryAddress } }) {
      index
      requestType
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
    requests(where: { recipient_: { 
        registry: $registryAddress,
        id: $recipientId
      }
    }) {
      index
      requestType
      status
      recipientIndex
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

// Query to fetch request by request index
const RequestByIndex = `
  query RequestByIndex($registryAddress: String!, $index: String!) {
    requests(where: { recipient_: { registry: $registryAddress }, index: $index }) {
      id
      index
      status
      requestType
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

// Query to fetch change request by recipient index
const ChangeRequestByRecipientIndex = `
  query RequestByRecipientIndex($registryAddress: String!, $recipientIndex: String!) {
    requests(where: { recipient_: { registry: $registryAddress }, recipientIndex: $recipientIndex, requestType: "Change" }) {
      index
      requestType
      status
      recipientIndex
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
 * Fetch request by index (there's no id, only index on contract)
 *
 * @param registryAddress - the registry address (registry id)
 * @param index - the request index (id)
 * @returns the request
 */
export async function fetchRequestByIndex(registryAddress: string, index: string): Promise<IRequest> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: RequestByIndex,
      variables: { index, registryAddress },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;

  if (!result.data?.requests) {
    throw new Error("No request found with this index");
  }

  return result.data.requests[0]!;
}

/**
 * Fetch request by recipientIndex
 *
 * @param registryAddress - the registry address
 * @param recipientIndex - the recipientIndex in request
 * @returns the request
 */
export async function fetchChangeRequestByRecipientIndex(
  registryAddress: string,
  recipientIndex: string,
): Promise<IRequest> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: ChangeRequestByRecipientIndex,
      variables: { recipientIndex, registryAddress },
    }),
  });

  const result = (await response.json()) as GraphQLResponse;

  if (!result.data?.requests) {
    throw new Error("No request found with this recipient index");
  }

  const last = result.data.requests.length - 1;

  return result.data.requests[last]!;
}
