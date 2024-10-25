import { differenceInDays } from "date-fns";
import dynamic from "next/dynamic";
import { useMemo, type PropsWithChildren } from "react";
import { Hex, zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { ConnectButton } from "~/components/ConnectButton";
import { Alert } from "~/components/ui/Alert";
import { Heading } from "~/components/ui/Heading";
import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";
import { useProjectCount } from "~/features/projects/hooks/useProjects";
import { useProjectsResults, useResults } from "~/hooks/useResults";
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
  pollId: string;
}

const Stats = ({ pollId }: IStatsProps) => {
  const { isLoading } = useMaci();
  const { chain, isConnected } = useAccount();
  const { getRoundByPollId } = useRound();

  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);
  const results = useResults(pollId, (round?.registryAddress ?? zeroAddress) as Hex, round?.tallyFile);
  const count = useProjectCount({
    chain: chain!,
    registryAddress: (round?.registryAddress ?? zeroAddress) as Hex,
  });

  const { data: projectsResults } = useProjectsResults((round?.registryAddress ?? zeroAddress) as Hex);

  const { averageVotes, projects = {} } = results.data ?? {};

  const chartData = useMemo(() => {
    const data = (projectsResults?.pages[0] ?? [])
      .map((project) => ({
        x: project.index,
        y: projects[project.id]?.votes,
      }))
      .slice(0, 15);

    return [{ id: "awarded", data }];
  }, [projects, projectsResults]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isConnected) {
    return (
      <Alert className="mx-auto max-w-sm text-center" variant="info">
        <Heading size="lg">Connect your wallet to see results</Heading>

        <div className="mt-4">
          <ConnectButton />
        </div>
      </Alert>
    );
  }

  return (
    <div>
      <Heading size="lg">Top Projects</Heading>

      <div className="mb-8 h-[400px] rounded-xl bg-white text-black">
        <ResultsChart data={chartData} />
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <Stat title="Projects applied">{count.data?.count.toString()}</Stat>

        <Stat title="Projects voted for">{Object.keys(projects).length}</Stat>

        <Stat title="People Voting">{round?.numSignups ? Number(round.numSignups) - 1 : 0}</Stat>

        <Stat title="Average votes per project">{formatNumber(averageVotes)}</Stat>
      </div>
    </div>
  );
};

interface IStatsPageProps {
  pollId: string;
}

const StatsPage = ({ pollId }: IStatsPageProps): JSX.Element => {
  const roundState = useRoundState(pollId);
  const { getRoundByPollId } = useRound();
  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);
  const duration = round?.votingEndsAt && differenceInDays(round.votingEndsAt, new Date());

  return (
    <Layout pollId={pollId}>
      <Heading as="h1" size="3xl">
        Stats
      </Heading>

      {roundState === ERoundState.RESULTS ? (
        <Stats pollId={pollId} />
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

export const getServerSideProps: GetServerSideProps = async ({ query: { pollId } }) =>
  Promise.resolve({
    props: { pollId },
  });
