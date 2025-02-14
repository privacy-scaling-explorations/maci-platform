import { useWallets } from "@privy-io/react-auth";
import { useMemo } from "react";

import { config } from "~/config";

export function useIsAdmin(): boolean {
  // Does this work with extension wallet?
  const { wallets } = useWallets();

  const wallet = useMemo(
    () => wallets.find((w) => w.walletClientType === "privy" || w.walletClientType === "metamask"),
    [wallets],
  );

  return config.admin === wallet?.address;
}
