import Link from "next/link";

import { useBallot } from "~/contexts/Ballot";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import { AddedProjects } from "./AddedProjects";
import { VotingUsage } from "./VotingUsage";

export const BallotOverview = (): JSX.Element => {
  const { ballot } = useBallot();

  const appState = useAppState();

  return (
    <Link
      href={
        ballot.published && (appState === EAppState.TALLYING || appState === EAppState.RESULTS)
          ? "/ballot/confirmation"
          : "/ballot"
      }
    >
      <div className="dark:bg-lightBlack my-8 flex-col items-center gap-2 rounded-lg bg-white p-5 uppercase shadow-lg dark:text-white">
        <h3>My Ballot</h3>

        <AddedProjects />

        <VotingUsage />
      </div>
    </Link>
  );
};
