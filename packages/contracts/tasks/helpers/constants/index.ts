import { EDeploySteps as EMaciDeploySteps, EContracts as EMaciContracts } from "maci-contracts";

/**
 * Deploy steps for maci-platform related constacts
 */
export enum EPlatformDeployStep {
  RegistryManager = "full:deploy-registry-manager",
}

/**
 * Deploy steps for maci and maci-platform
 */
export const EDeploySteps = {
  ...EMaciDeploySteps,
  ...EPlatformDeployStep,
};

/**
 * Contracts for maci-platform related constacts
 */
export enum EPlatformContracts {
  EASRegistryManager = "EASRegistryManager",
  RegistryManager = "RegistryManager",
  EASRegistry = "EASRegistry",
  SimpleRegistry = "SimpleRegistry",
}

/**
 * Contracts for maci and maci-platform
 */
export const EContracts = {
  ...EMaciContracts,
  ...EPlatformContracts,
};

/**
 * Supported registry manager types
 */
export type TRegistryManager = EPlatformContracts.EASRegistryManager | EPlatformContracts.RegistryManager;

/**
 * Supported registry types
 */
export type TRegistry = EPlatformContracts.EASRegistry | EPlatformContracts.SimpleRegistry;

/**
 * Registry types by registry manager
 */
export const REGISTRY_TYPES: Record<TRegistryManager, TRegistry> = {
  [EPlatformContracts.EASRegistryManager]: EPlatformContracts.EASRegistry,
  [EPlatformContracts.RegistryManager]: EPlatformContracts.SimpleRegistry,
};

/**
 * Supported networks for deployment and task running
 */
export enum ESupportedChains {
  Sepolia = "sepolia",
  Optimism = "optimism",
  OptimismSepolia = "optimism_sepolia",
  Scroll = "scroll",
  ScrollSepolia = "scroll_sepolia",
  Arbitrum = "arbitrum",
  ArbitrumSepolia = "arbitrum_sepolia",
  Base = "base",
  BaseSepolia = "base_sepolia",
  Coverage = "coverage",
  Hardhat = "hardhat",
}

/**
 * Supported network chain ids for deployment and task running
 */
export enum EChainId {
  Hardhat = 31337,
  Optimism = 10,
  OptimismSepolia = 11155420,
  Sepolia = 11155111,
  Scroll = 534352,
  ScrollSepolia = 534351,
  Arbitrum = 42161,
  ArbitrumSepolia = 421614,
  Base = 8453,
  BaseSepolia = 84532,
  Coverage = 1337,
}

/**
 * Get network rpc urls object
 *
 * @returns {Record<ESupportedChains, string>} rpc urls for supported networks
 */
export const getNetworkRpcUrls = (): Record<ESupportedChains, string> => {
  const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL ?? "";
  const OP_RPC_URL = process.env.OP_RPC_URL ?? "";
  const OP_SEPOLIA_RPC_URL = process.env.OP_SEPOLIA_RPC_URL ?? "";
  const SCROLL_RPC_URL = process.env.SCROLL_RPC_URL ?? "";
  const SCROLL_SEPOLIA_RPC_URL = process.env.SCROLL_SEPOLIA_RPC_URL ?? "";
  const ARB_RPC_URL = process.env.ARB_RPC_URL ?? "";
  const ARB_SEPOLIA_RPC_URL = process.env.ARB_SEPOLIA_RPC_URL ?? "";
  const BASE_RPC_URL = process.env.BASE_RPC_URL ?? "";
  const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL ?? "";

  return {
    [ESupportedChains.Sepolia]: SEPOLIA_RPC_URL,
    [ESupportedChains.Optimism]: OP_RPC_URL,
    [ESupportedChains.OptimismSepolia]: OP_SEPOLIA_RPC_URL,
    [ESupportedChains.Scroll]: SCROLL_RPC_URL,
    [ESupportedChains.ScrollSepolia]: SCROLL_SEPOLIA_RPC_URL,
    [ESupportedChains.Arbitrum]: ARB_RPC_URL,
    [ESupportedChains.ArbitrumSepolia]: ARB_SEPOLIA_RPC_URL,
    [ESupportedChains.Base]: BASE_RPC_URL,
    [ESupportedChains.BaseSepolia]: BASE_SEPOLIA_RPC_URL,
    [ESupportedChains.Coverage]: "http://localhost:8555",
    [ESupportedChains.Hardhat]: "http://localhost:8545",
  };
};

export const getEtherscanApiKeys = (): Record<ESupportedChains, string | undefined> => ({
  [ESupportedChains.Sepolia]: process.env.ETH_ETHERSCAN_API_KEY,
  [ESupportedChains.Optimism]: process.env.OPTIMISM_ETHERSCAN_API_KEY,
  [ESupportedChains.OptimismSepolia]: process.env.OPTIMISM_ETHERSCAN_API_KEY,
  [ESupportedChains.Scroll]: process.env.SCROLL_ETHERSCAN_API_KEY,
  [ESupportedChains.ScrollSepolia]: process.env.SCROLL_ETHERSCAN_API_KEY,
  [ESupportedChains.Arbitrum]: process.env.ARB_ETHERSCAN_API_KEY,
  [ESupportedChains.ArbitrumSepolia]: process.env.ARB_ETHERSCAN_API_KEY,
  [ESupportedChains.Base]: process.env.BASE_ETHERSCAN_API_KEY,
  [ESupportedChains.BaseSepolia]: process.env.BASE_ETHERSCAN_API_KEY,
  [ESupportedChains.Coverage]: undefined,
  [ESupportedChains.Hardhat]: undefined,
});
