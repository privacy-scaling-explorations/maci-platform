import { z } from "zod";

export const MetadataSchema = z.object({
  name: z.string().min(3),
  metadataType: z.enum(["1"]),
  metadataPtr: z.string().min(3),
});

export const ApplicationSchema = z.object({
  name: z.string().min(3),
  profileImageUrl: z.string().optional(),
});

export type Application = z.infer<typeof ApplicationSchema>;

export const ApplicationsToApproveSchema = z.object({
  selected: z.array(z.string()),
});
export type TApplicationsToApprove = z.infer<typeof ApplicationsToApproveSchema>;
