import { z } from "zod";

export const MetadataSchema = z.object({
  name: z.string().min(3),
  metadataType: z.enum(["1"]),
  metadataPtr: z.string().min(3),
});

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

export const ApplicationSchema = z.object({
  name: z.string().min(3),
  bio: z.string().min(3),
  profileImageUrl: z.string().optional(),
  bannerImageUrl: z.string().optional(),
  websiteUrl: z
    .string()
    .min(1)
    .transform((url) =>
      // Automatically prepend "https://" if it's missing
      /^(http:\/\/|https:\/\/)/i.test(url) ? url : `https://${url}`,
    ),
  twitter: z.string().optional(),
  activitiesDescription: z.string().min(3),
});

export type Application = z.infer<typeof ApplicationSchema>;

export const ApplicationsToApproveSchema = z.object({
  selected: z.array(z.string()),
});
export type TApplicationsToApprove = z.infer<typeof ApplicationsToApproveSchema>;
