import Link from "next/link";

import { Heading } from "~/components/ui/Heading";
import { useBallot } from "~/contexts/Ballot";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import { AddedProjects } from "./AddedProjects";
import { VotingUsage } from "./VotingUsage";

interface IBallotOverviewProps {
  title?: string;
}

export const BallotOverview = ({ title = undefined }: IBallotOverviewProps): JSX.Element => {
  const { ballot } = useBallot();

  const appState = useAppState();

  return (
    <div className="w-full">
      <Link
        href={
          ballot.published && (appState === EAppState.TALLYING || appState === EAppState.RESULTS)
            ? "/ballot/confirmation"
            : "/ballot"
        }
      >
        {title && (
          <Heading as="h3" size="3xl">
            {title}
          </Heading>
        )}

        <AddedProjects />

        <VotingUsage />
      </Link>
    </div>
  );
};
