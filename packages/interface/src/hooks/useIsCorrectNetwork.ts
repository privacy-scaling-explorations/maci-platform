import { useChainId } from "wagmi";

import { config } from "~/config";
import { useAccount } from "~/contexts/Account";

export interface IUseIsCorrectNetworkReturn {
  isCorrectNetwork: boolean;
  correctNetwork: typeof config.network;
}

export function useIsCorrectNetwork(): IUseIsCorrectNetworkReturn {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const isCorrectNetwork = isConnected && chainId === config.network.id;

  return {
    isCorrectNetwork,
    correctNetwork: config.network,
  };
}
