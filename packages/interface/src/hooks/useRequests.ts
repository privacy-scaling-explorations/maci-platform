import { api } from "~/utils/api";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { IRequest } from "~/utils/types";

export function useApprovedRequests(registryAddress: string): UseTRPCQueryResult<IRequest[], unknown> {
  return api.requests.approvals.useQuery({ registryAddress });
}

export function usePendingRequests(registryAddress: string): UseTRPCQueryResult<IRequest[], unknown> {
  return api.requests.pending.useQuery({ registryAddress });
}

export function useRequestByProjectId(
  projectId: string,
  registryAddress: string,
): UseTRPCQueryResult<IRequest, unknown> {
  return api.requests.getByProjectId.useQuery({ projectId, registryAddress });
}

export function useRequestByIndex(registryAddress: string, index: string): UseTRPCQueryResult<IRequest, unknown> {
  return api.requests.getByIndex.useQuery({ registryAddress, index });
}

export function useChangeRequestByRecipientIndex(
  registryAddress: string,
  recipientIndex: string,
): UseTRPCQueryResult<IRequest, unknown> {
  return api.requests.getEditionByRecipientIndex.useQuery({ registryAddress, recipientIndex });
}
