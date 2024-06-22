import { useAccount } from "wagmi";

import { config } from "~/config";

export function useIsAdmin(): boolean {
  const { address } = useAccount();

  return config.admin === address!;
}
