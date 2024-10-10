import { z } from "zod";

export const RoundSchema = z.object({
  roundId: z.string(),
  description: z.string(),
  startsAt: z.number(),
  registrationEndsAt: z.number(),
  votingEndsAt: z.number(),
  tallyURL: z.string().optional(),
});

export type Round = z.infer<typeof RoundSchema>;
