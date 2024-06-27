import { AddedProjects } from "./AddedProjects";
import { VotingUsage } from "./VotingUsage";

export const BallotOverview = (): JSX.Element => (
  <div className="my-8 flex-col items-center gap-2 rounded-lg bg-white p-5 uppercase shadow-lg">
    <h3>My Ballot</h3>

    <AddedProjects />

    <VotingUsage />
  </div>
);
