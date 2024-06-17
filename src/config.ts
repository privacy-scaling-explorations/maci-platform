import * as wagmiChains from "wagmi/chains";

export const metadata = {
  title: "MACI RPGF",
  description: "Open-source Retro Public Goods Funding platform",
  url: "https://maci-rpgf.vercel.app",
  image: "/api/og",
};

export const config = {
  logoUrl: "/Logo.svg",
  pageSize: 3 * 4,
  // TODO: temp solution until we come up with solid one
  // https://github.com/privacy-scaling-explorations/maci-rpgf/issues/31
  voteLimit: 50,
  startsAt: new Date(process.env.NEXT_PUBLIC_START_DATE!),
  registrationEndsAt: new Date(process.env.NEXT_PUBLIC_REGISTRATION_END_DATE!),
  resultsAt: new Date(process.env.NEXT_PUBLIC_RESULTS_DATE!),
  skipApprovedVoterCheck: ["true", "1"].includes(
    process.env.NEXT_PUBLIC_SKIP_APPROVED_VOTER_CHECK!,
  ),
  tokenName: process.env.NEXT_PUBLIC_TOKEN_NAME!,
  eventName: process.env.NEXT_PUBLIC_EVENT_NAME ?? "MACI-RPGF",
  roundId: process.env.NEXT_PUBLIC_ROUND_ID!,
  admin: (process.env.NEXT_PUBLIC_ADMIN_ADDRESS ?? "") as `0x${string}`,
  network:
    wagmiChains[process.env.NEXT_PUBLIC_CHAIN_NAME as keyof typeof wagmiChains],
  maciAddress: process.env.NEXT_PUBLIC_MACI_ADDRESS,
  maciStartBlock: Number(process.env.NEXT_PUBLIC_MACI_START_BLOCK ?? 0),
  maciSubgraphUrl: process.env.NEXT_PUBLIC_MACI_SUBGRAPH_URL ?? "",
  tallyUrl: process.env.NEXT_PUBLIC_TALLY_URL,
};

export const theme = {
  colorMode: "light",
};

export const eas = {
  url: process.env.NEXT_PUBLIC_EASSCAN_URL ?? "",
  attesterAddress: process.env.NEXT_PUBLIC_APPROVED_APPLICATIONS_ATTESTER ?? "",

  contracts: {
    eas:
      process.env.NEXT_PUBLIC_EAS_CONTRACT_ADDRESS ??
      "0x4200000000000000000000000000000000000021",
    schemaRegistry:
      process.env.NEXT_PUBLIC_EAS_SCHEMA_REGISTRY_ADDRESS ??
      "0x4200000000000000000000000000000000000020",
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
