import { z } from "zod";

export const VoteSchema = z.object({
  projectId: z.string(),
  amount: z.number().min(0),
  projectIndex: z.number().min(0),
});

export const BallotSchema = z.object({
  votes: z.array(VoteSchema),
  published: z.boolean().default(false),
  edited: z.boolean().default(false),
  pollId: z.string().optional(),
});

export type Vote = z.infer<typeof VoteSchema>;
export type Ballot = z.infer<typeof BallotSchema>;
