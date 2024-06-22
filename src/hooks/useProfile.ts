import { type Address } from "viem";

import { api } from "~/utils/api";

import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import type { Attestation } from "~/utils/fetchAttestations";

import { useMetadata } from "./useMetadata";

export function useProfile(id?: Address): UseTRPCQueryResult<Attestation, unknown> {
  return api.profile.get.useQuery({ id: String(id) }, { enabled: Boolean(id) });
}

export function useProfileWithMetadata(
  id?: Address,
): UseTRPCQueryResult<{ profileImageUrl: string; bannerImageUrl: string }, unknown> {
  const profile = useProfile(id);

  return useMetadata<{ profileImageUrl: string; bannerImageUrl: string }>(profile.data?.metadataPtr);
}
