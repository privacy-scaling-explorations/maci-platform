import { z } from "zod";

import { reverseKeys } from "~/utils/reverseKeys";

export const votingStrategyTypes = {
  SIMPLE: "non-qv",
  QUADRATIC_VOTING: "qv",
  RANKED: "ranked",
} as const;

export const chainTypes = {
  ethereum: "ethereum",
  optimism: "optimism",
  optimismSepolia: "optimismSepolia",
  scroll: "scroll",
  scrollSepolia: "scrollSepolia",
  arbitrum: "arbitrum",
  linea: "linea",
  sepolia: "sepolia",
  base: "base",
  baseSepolia: "baseSepolia",
  localhost: "localhost",
} as const;

export const gatingStrategyTypes = {
  ZUPASS: "zupass",
  FREEFORALL: "freeforall",
  EAS: "eas",
  SEMAPHORE: "semaphore",
} as const;

export const creditStrategyTypes = {
  CONSTANT: "constant",
  QF: "qf",
  TOKEN: "token",
} as const;

export const RoundSchema = z.object({
  roundId: z.string(),
  roundLogo: z.string().optional(),
  description: z.string(),
  startsAt: z.string(),
  registrationEndsAt: z.string(),
  votingStartsAt: z.string(),
  votingEndsAt: z.string(),
  votingStrategy: z.nativeEnum(reverseKeys(votingStrategyTypes)),
  tallyURL: z.string().optional(),
});

export type Round = z.infer<typeof RoundSchema>;

export const DeploymentSchema = z.object({
  chain: z.nativeEnum(chainTypes),
  gatingStrategy: z.nativeEnum(gatingStrategyTypes),
  creditStrategy: z.nativeEnum(creditStrategyTypes),
  creditAmount: z.number(),
});

export type Deployment = z.infer<typeof DeploymentSchema>;
