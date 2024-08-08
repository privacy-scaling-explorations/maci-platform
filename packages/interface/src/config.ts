import * as wagmiChains from "wagmi/chains";

export const metadata = {
  title: "MACI PLATFORM",
  description: "Open-source Retro Public Goods Funding platform with MACI for private on chain voting/",
  url: "https://maci-platform.vercel.app",
  image: "/api/og",
};

const parseDate = (env?: string) => (env ? new Date(env) : undefined);

// URLs for the EAS GraphQL endpoint for each chain
const easScanUrl = {
  ethereum: "https://easscan.org/graphql",
  optimism: "https://optimism.easscan.org/graphql",
  optimismSepolia: "https://optimism-sepolia.easscan.org/graphql",
  arbitrum: "	https://arbitrum.easscan.org/graphql",
  linea: "https://linea.easscan.org/graphql",
  sepolia: "https://sepolia.easscan.org/graphql",
  base: "https://base.easscan.org/graphql",
};

// EAS contract addresses for each chain
const easContractAddresses = {
  ethereum: "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587",
  optimism: "0x4200000000000000000000000000000000000021",
  optimismSepolia: "0x4200000000000000000000000000000000000021",
  arbitrum: "0xbD75f629A22Dc1ceD33dDA0b68c546A1c035c458",
  linea: "0xaEF4103A04090071165F78D45D83A0C0782c2B2a",
  sepolia: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
  base: "0x4200000000000000000000000000000000000021",
};

// EAS Schema Registry contract addresses for each chain
const easSchemaRegistryContractAddresses = {
  ethereum: "0xA7b39296258348C78294F95B872b282326A97BDF",
  optimism: "0x4200000000000000000000000000000000000020",
  optimismSepolia: "0x4200000000000000000000000000000000000020",
  arbitrum: "0xA310da9c5B885E7fb3fbA9D66E9Ba6Df512b78eB",
  linea: "0x55D26f9ae0203EF95494AE4C170eD35f4Cf77797",
  sepolia: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
  base: "0x4200000000000000000000000000000000000020",
};

/**
 * Convert the chain name for the semaphore ethers library
 * @returns the chain name for the semaphore ethers library
 */
export const semaphoreEthersChain = (): string => {
  switch (process.env.NEXT_PUBLIC_CHAIN_NAME) {
    case "optimismSepolia":
      return "optimism-sepolia";
    default:
      return process.env.NEXT_PUBLIC_CHAIN_NAME!;
  }
};

/**
 * Get the RPC URL based on the network we are connected to
 * @returns the alchemy RPC URL
 */
export const getRPCURL = (): string | undefined => {
  switch (process.env.NEXT_PUBLIC_CHAIN_NAME) {
    case "optimismSepolia":
      return `https://opt-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID!}`;
    default:
      return undefined;
  }
};

export const config = {
  logoUrl: "/Logo.svg",
  pageSize: 3 * 4,
  // TODO: temp solution until we come up with solid one
  // https://github.com/privacy-scaling-explorations/maci-platform/issues/31
  voteLimit: 50,
  startsAt: parseDate(process.env.NEXT_PUBLIC_START_DATE),
  registrationEndsAt: parseDate(process.env.NEXT_PUBLIC_REGISTRATION_END_DATE),
  resultsAt: parseDate(process.env.NEXT_PUBLIC_RESULTS_DATE),
  skipApprovedVoterCheck: ["true", "1"].includes(process.env.NEXT_PUBLIC_SKIP_APPROVED_VOTER_CHECK!),
  tokenName: process.env.NEXT_PUBLIC_TOKEN_NAME!,
  eventName: process.env.NEXT_PUBLIC_EVENT_NAME ?? "MACI-PLATFORM",
  roundId: process.env.NEXT_PUBLIC_ROUND_ID!,
  admin: (process.env.NEXT_PUBLIC_ADMIN_ADDRESS ?? "") as `0x${string}`,
  network: wagmiChains[process.env.NEXT_PUBLIC_CHAIN_NAME as keyof typeof wagmiChains],
  maciAddress: process.env.NEXT_PUBLIC_MACI_ADDRESS,
  maciStartBlock: Number(process.env.NEXT_PUBLIC_MACI_START_BLOCK ?? 0),
  maciSubgraphUrl: process.env.NEXT_PUBLIC_MACI_SUBGRAPH_URL ?? "",
  tallyUrl: process.env.NEXT_PUBLIC_TALLY_URL,
  roundOrganizer: process.env.NEXT_PUBLIC_ROUND_ORGANIZER ?? "PSE",
  pollMode: process.env.NEXT_PUBLIC_POLL_MODE ?? "non-qv",
  roundLogo: process.env.NEXT_PUBLIC_ROUND_LOGO,
  semaphoreSubgraphUrl: process.env.NEXT_PUBLIC_SEMAPHORE_SUBGRAPH,
};

export const theme = {
  colorMode: "light",
};

export const eas = {
  url: easScanUrl[process.env.NEXT_PUBLIC_CHAIN_NAME as keyof typeof easScanUrl],
  attesterAddress: process.env.NEXT_PUBLIC_APPROVED_APPLICATIONS_ATTESTER ?? "",

  contracts: {
    eas: easContractAddresses[process.env.NEXT_PUBLIC_CHAIN_NAME as keyof typeof easContractAddresses],
    schemaRegistry:
      easSchemaRegistryContractAddresses[
        process.env.NEXT_PUBLIC_CHAIN_NAME as keyof typeof easSchemaRegistryContractAddresses
      ],
  },
  schemas: {
    metadata: process.env.NEXT_PUBLIC_METADATA_SCHEMA!,
    approval: process.env.NEXT_PUBLIC_APPROVAL_SCHEMA!,
  },
};

export const impactCategories = {
  ETHEREUM_INFRASTRUCTURE: { label: "Ethereum Infrastructure" },
  OPEN_SOURCE: { label: "Web3 Open Source Software" },
  COMMUNITY_EDUCATION: { label: "Web3 Community & Education" },
  COLLECTIVE_GOVERNANCE: { label: "Collective Governance" },
  OP_STACK: { label: "OP Stack" },
  DEVELOPER_ECOSYSTEM: { label: "Developer Ecosystem" },
  END_USER_EXPERIENCE_AND_ADOPTION: { label: "End user UX" },
} as const;
