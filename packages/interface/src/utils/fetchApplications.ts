import { config } from "~/config";

import { IRecipient, IRequest } from "./types";

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

/**
 * Fetch all pending applications
 *
 * @returns the pending add requests
 */
export async function fetchPendingApplications(): Promise<IRequest[]> {
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

  return result.data?.requests || [];
}
