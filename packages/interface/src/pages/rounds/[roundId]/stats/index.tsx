import { differenceInDays } from "date-fns";
import dynamic from "next/dynamic";
import { useMemo, type PropsWithChildren } from "react";
import { useAccount } from "wagmi";

import { ConnectButton } from "~/components/ConnectButton";
import { Alert } from "~/components/ui/Alert";
import { Heading } from "~/components/ui/Heading";
import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";
import { useProjectCount, useProjectsResults, useResults } from "~/hooks/useResults";
import { Layout } from "~/layouts/DefaultLayout";
import { formatNumber } from "~/utils/formatNumber";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { GetServerSideProps } from "next";

const ResultsChart = dynamic(async () => import("~/features/results/components/Chart"), { ssr: false });

const Stat = ({ title, children = null }: PropsWithChildren<{ title: string }>) => (
  <div className="rounded border p-2">
    <Heading className="text-gray-500" size="3xl">
      {title}
    </Heading>

    <div className="text-4xl">{children}</div>
  </div>
);

interface IStatsProps {
  roundId: string;
}

const Stats = ({ roundId }: IStatsProps) => {
  const { isLoading, pollData } = useMaci();
  const results = useResults(roundId, pollData);
  const count = useProjectCount(roundId);
  const { data: projectsResults } = useProjectsResults(roundId, pollData);
  const { isConnected } = useAccount();

  const { averageVotes, projects = {} } = results.data ?? {};

  const chartData = useMemo(() => {
    const data = (projectsResults?.pages[0] ?? [])
      .map((project) => ({
        x: project.name,
        y: projects[project.id]?.votes,
      }))
      .slice(0, 15);

    return [{ id: "awarded", data }];
  }, [projects, projectsResults]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!pollData && !isConnected) {
    return (
      <Alert className="mx-auto max-w-sm text-center" variant="info">
        <Heading size="lg">Connect your wallet to see results</Heading>

        <div className="mt-4">
          <ConnectButton />
        </div>
      </Alert>
    );
  }

  if (!pollData) {
    return <div>Something went wrong. Try later.</div>;
  }

  return (
    <div>
      <Heading size="lg">Top Projects</Heading>

      <div className="mb-8 h-[400px] rounded-xl bg-white text-black">
        <ResultsChart data={chartData} />
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <Stat title="Projects applied">{count.data?.count}</Stat>

        <Stat title="Projects voted for">{Object.keys(projects).length}</Stat>

        <Stat title="People Voting">{pollData.numSignups ? Number(pollData.numSignups) - 1 : 0}</Stat>

        <Stat title="Average votes per project">{formatNumber(averageVotes)}</Stat>
      </div>
    </div>
  );
};

interface IStatsPageProps {
  roundId: string;
}

const StatsPage = ({ roundId }: IStatsPageProps): JSX.Element => {
  const roundState = useRoundState(roundId);
  const { getRound } = useRound();
  const round = getRound(roundId);
  const duration = round?.votingEndsAt && differenceInDays(round.votingEndsAt, new Date());

  return (
    <Layout roundId={roundId}>
      <Heading as="h1" size="3xl">
        Stats
      </Heading>

      {roundState === ERoundState.RESULTS ? (
        <Stats roundId={roundId} />
      ) : (
        <Alert className="mx-auto max-w-sm text-center" variant="info">
          The results will be revealed in <div className="text-3xl">{duration && duration > 0 ? duration : 0}</div>
          days
        </Alert>
      )}
    </Layout>
  );
};

export default StatsPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { roundId } }) =>
  Promise.resolve({
    props: { roundId },
  });
