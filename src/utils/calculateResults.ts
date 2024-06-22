import { type Vote } from "~/features/ballot/types";

/*
Payout styles:
Custom: 
- Sum up all the votes
OP-style:
- A project must have a minimum of x voters (threshold)
- Median value is counted
*/

export interface PayoutOptions {
  style: "custom" | "op";
  threshold?: number;
}

export type BallotResults = Record<
  string,
  {
    voters: number;
    votes: number;
  }
>;

export function calculateVotes(
  ballots: { voterId: string; votes: Vote[] }[],
  payoutOpts: PayoutOptions = { style: "custom" },
): BallotResults {
  const projectVotes: Record<
    string,
    {
      total: number;
      amounts: number[];
      voterIds: Set<string>;
    }
  > = {};

  ballots.forEach((ballot) => {
    ballot.votes.forEach((vote) => {
      if (!projectVotes[vote.projectId]) {
        projectVotes[vote.projectId] = {
          total: 0,
          amounts: [],
          voterIds: new Set(),
        };
      }
      projectVotes[vote.projectId]!.total += vote.amount;
      projectVotes[vote.projectId]!.amounts.push(vote.amount);
      projectVotes[vote.projectId]!.voterIds.add(ballot.voterId);
    });
  });

  const projects: BallotResults = {};

  Object.entries(projectVotes).forEach(([projectId, value]) => {
    const { total, amounts, voterIds } = value;

    const voteIsCounted =
      payoutOpts.style === "custom" || (payoutOpts.threshold && voterIds.size >= payoutOpts.threshold);

    if (voteIsCounted) {
      projects[projectId] = {
        voters: voterIds.size,
        votes: payoutOpts.style === "op" ? calculateMedian(amounts.sort((a, b) => a - b)) : total,
      };
    }
  });

  return projects;
}

function calculateMedian(arr: number[]): number {
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 !== 0 ? arr[mid] ?? 0 : ((arr[mid - 1] ?? 0) + (arr[mid] ?? 0)) / 2;
}
