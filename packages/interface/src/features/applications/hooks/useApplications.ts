import { api } from "~/utils/api";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { IRequest, IRecipient } from "~/utils/types";

export function useApprovedApplications(registryAddress: string): UseTRPCQueryResult<IRequest[], unknown> {
  return api.applications.approvals.useQuery({ registryAddress });
}

export function usePendingApplications(registryAddress: string): UseTRPCQueryResult<IRequest[], unknown> {
  return api.applications.pending.useQuery({ registryAddress });
}

export function useApplicationByProjectId(
  projectId: string,
  registryAddress: string,
): UseTRPCQueryResult<IRequest, unknown> {
  return api.applications.getByProjectId.useQuery({ projectId, registryAddress });
}

export function useAllApplications(registryAddress: string): UseTRPCQueryResult<IRequest, unknown> {
  return api.applications.getByIds.useQuery({ registryAddress, ids: [] });
}

export function useApplicationById(registryAddress: string, id: string): UseTRPCQueryResult<IRequest, unknown> {
  return api.applications.getById.useQuery({ registryAddress, id });
}

export function useApplicationsByIds(registryAddress: string, ids: string[]): UseTRPCQueryResult<IRequest[], unknown> {
  return api.applications.getByIds.useQuery({ registryAddress, ids });
}

export function useMyApplications(registryAddress: string, address: string): UseTRPCQueryResult<IRecipient[], unknown> {
  return api.projects.getMine.useQuery({ registryAddress, address });
}
