import Link from "next/link";

import { Heading } from "~/components/ui/Heading";
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
        <Heading as="h3" size="3xl">
          My Ballot
        </Heading>

        <AddedProjects />

        <VotingUsage />
      </div>
    </Link>
  );
};
