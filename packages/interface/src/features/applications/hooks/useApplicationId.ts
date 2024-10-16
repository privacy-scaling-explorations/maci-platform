import { api } from "~/utils/api";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { IRequest } from "~/utils/types";

export function useApplicationById(registryAddress: string, id: string): UseTRPCQueryResult<IRequest, unknown> {
  return api.applications.getById.useQuery({ registryAddress, id });
}
