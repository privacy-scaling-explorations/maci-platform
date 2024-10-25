import { api } from "~/utils/api";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { IRequest } from "~/utils/types";

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
