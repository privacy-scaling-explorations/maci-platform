import { config } from "~/config";

import { IApplication, IRequest } from "./types";

export interface GraphQLResponse {
  data?: {
    requests: IRequest[];
  };
}

const PendingRequests = `
  query PendingAddRequests {
    requests(where: { requestType: "Add", status: "Pending" }) {
      id
      recipient {
        id
        metadataUrl
        index
        payout
        registry {
          id
        }
      }
    }
  }
`;

const RejectedRequests = `
  query RejectedRequests {
    requests(where: { status: "Rejected" }) {
      id
      recipient {
        id
        metadataUrl
        index
        payout
        registry {
          id
        }
      }
    }
  }
`;


const ApprovedRequests = `
  query ApprovedRequests {
    requests(where: { status: "Approved" }) {
      id
      recipient {
        id
        metadataUrl
        index
        payout
        registry {
          id
        }
      }
    }
  }
`;

/**
 * Filter requests by registry ID
 *
 * @param requests - the requests to filter
 * @param registryId - the registry ID to filter by
 * @returns the filtered requests
 */
const filterRequestsByRegistryId = (requests: any[], registryId: string) => {
  return requests.filter(request => 
    request.recipient?.registry?.id.toLowerCase() === registryId.toLowerCase()
  )
}

/**
 * Fetch all pending applications
 *
 * @returns the pending add requests
 */
export async function fetchPendingApplications(registryId: string): Promise<IApplication[]> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: PendingRequests,
    }),
  });

  const result: GraphQLResponse = await response.json();

  const filtered = filterRequestsByRegistryId(result.data?.requests || [], registryId);

  const applications = filtered.map((request) => ({
    id: request.id,
    metadataPtr: request.recipient.metadataUrl,
    recipient: request.recipient.id,
  }));

  return applications;
}

/**
 * Fetch applications that have been rejected
 *
 * @param registryId - the registry ID to filter by
 * @returns the rejected add requests
 */
export async function fetchRejectedApplications(registryId: string): Promise<IApplication[]> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: RejectedRequests,
    }),
  });

  const result: GraphQLResponse = await response.json();

  const filtered = filterRequestsByRegistryId(result.data?.requests || [], registryId);

  const applications = filtered.map((request) => ({
    id: request.id,
    metadataPtr: request.recipient.metadataUrl,
    recipient: request.recipient.id,
  }));

  return applications;
}

/**
 * Fetch applications that have been approved
 *
 * @param registryId - the registry ID to filter by
 * @returns the approved add requests
 */
export async function fetchApprovedApplications(registryId: string): Promise<IApplication[]> {
  const response = await fetch(config.maciSubgraphUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: ApprovedRequests,
    }),
  });
  
  const result: GraphQLResponse = await response.json();

  const filtered = filterRequestsByRegistryId(result.data?.requests || [], registryId);

  const applications = filtered.map((request) => ({
    id: request.id,
    metadataPtr: request.recipient.metadataUrl,
    recipient: request.recipient.id,
  }));

  return applications;
}
