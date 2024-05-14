import * as wagmiChains from "wagmi/chains";

export const metadata = {
  title: "Ethereum México PGF",
  description: "Open-source Retro Public Goods Funding platform",
  url: "https://easy-retro-pgf.vercel.app",
  image: "/api/og",
};

export const config = {
  logoUrl: "",
  pageSize: 3 * 4,
  // TODO: temp solution until we come up with solid one
  // https://github.com/privacy-scaling-explorations/maci-rpgf/issues/31
  voteLimit: 50,
  startsAt: new Date(process.env.NEXT_PUBLIC_START_DATE!),
  registrationEndsAt: new Date(process.env.NEXT_PUBLIC_REGISTRATION_END_DATE!),
  reviewEndsAt: new Date(process.env.NEXT_PUBLIC_REVIEW_END_DATE!),
  resultsAt: new Date(process.env.NEXT_PUBLIC_RESULTS_DATE!),
  skipApprovedVoterCheck: ["true", "1"].includes(
    process.env.NEXT_PUBLIC_SKIP_APPROVED_VOTER_CHECK!,
  ),
  tokenName: process.env.NEXT_PUBLIC_TOKEN_NAME!,
  roundId: process.env.NEXT_PUBLIC_ROUND_ID!,
  admins: (process.env.NEXT_PUBLIC_ADMIN_ADDRESSES ?? "").split(
    ",",
  ) as `0x${string}`[],
  network:
    wagmiChains[process.env.NEXT_PUBLIC_CHAIN_NAME as keyof typeof wagmiChains],
  maciAddress: process.env.NEXT_PUBLIC_MACI_ADDRESS,
  maciStartBlock: Number(process.env.NEXT_PUBLIC_MACI_START_BLOCK ?? 0),
  tallyUrl: process.env.NEXT_PUBLIC_TALLY_URL,
};

export const nativeToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
export const allo = {
  alloAddress: process.env.NEXT_PUBLIC_ALLO2_ADDRESS as `0x${string}`,
  strategyAddress: process.env.NEXT_PUBLIC_STRATEGY_ADDRESS as `0x${string}`,
  // eslint-disable-next-line
  tokenAddress: (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ||
    nativeToken) as `0x${string}`,
};
export const isNativeToken = allo.tokenAddress === nativeToken;

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
  DISMINUCION_BRECHA_GENERO: { label: "Disminución de Brecha de Género " },
  ONBOARDING_NUEVOS_USUARIOS: { label: "Onboarding de Nuevos Usuarios" },
  COMUNIDADES_LOCALES: { label: "Comunidades Locales" },
  REFI: { label: "ReFi" },
} as const;
