import { usePrivy } from "@privy-io/react-auth";
import { useChainId } from "wagmi";

import { config } from "~/config";

export interface IUseIsCorrectNetworkReturn {
  isCorrectNetwork: boolean;
  correctNetwork: typeof config.network;
}

export function useIsCorrectNetwork(): IUseIsCorrectNetworkReturn {
  const { authenticated } = usePrivy();
  const chainId = useChainId();

  const isCorrectNetwork = authenticated && chainId === config.network.id;

  return {
    isCorrectNetwork,
    correctNetwork: config.network,
  };
}
