import { z } from "zod";

import { EthAddressSchema } from "~/features/voters/types";
import { reverseKeys } from "~/utils/reverseKeys";

export const contributionTypes = {
  CONTRACT_ADDRESS: "Contract address",
  GITHUB_REPO: "Github repo",
  OTHER: "Other",
} as const;

export const fundingSourceTypes = {
  GOVERNANCE_FUND: "Governance fund",
  PARTNER_FUND: "Partner fund",
  REVENUE: "Revenue",
  OTHER: "Other",
} as const;

export const MetadataSchema = z.object({
  name: z.string().min(3),
  shortBio: z.string().max(140),
  bio: z.string().min(3),
  creator: z.string().optional(),
  profileImageUrl: z.string().optional(),
  bannerImageUrl: z.string().optional(),
  submittedAt: z.number().optional(),
  websiteUrl: z
    .string()
    .min(1)
    .transform((url) =>
      // Automatically prepend "https://" if it's missing
      /^(http:\/\/|https:\/\/)/i.test(url) ? url : `https://${url}`,
    ),
  payoutAddress: EthAddressSchema,
  github: z.string().optional(),
  twitter: z.string().optional(),
  contributionDescription: z.string().min(3),
  impactDescription: z.string().min(3),
  impactCategory: z.array(z.string()).min(1).optional(),
  contributionLinks: z
    .array(
      z.object({
        description: z.string().min(3),
        type: z.nativeEnum(reverseKeys(contributionTypes)),
        url: z
          .string()
          .min(1)
          .transform((url) =>
            // Automatically prepend "https://" if it's missing
            /^(http:\/\/|https:\/\/)/i.test(url) ? url : `https://${url}`,
          ),
      }),
    )
    .default([])
    .optional(),
  fundingSources: z
    .array(
      z.object({
        description: z.string().min(3),
        amount: z.number(),
        currency: z.string().min(3).max(4),
        type: z.nativeEnum(reverseKeys(fundingSourceTypes)),
      }),
    )
    .default([])
    .optional(),
});

export type Metadata = z.infer<typeof MetadataSchema>;

export const RequestSchema = z.object({
  selected: z.array(z.string()),
});
export type TRequestToApprove = z.infer<typeof RequestSchema>;
