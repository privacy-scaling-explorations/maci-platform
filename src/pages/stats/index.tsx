import { differenceInDays } from "date-fns";
import dynamic from "next/dynamic";
import { useMemo, type PropsWithChildren } from "react";
import { useAccount } from "wagmi";

import { ConnectButton } from "~/components/ConnectButton";
import { Alert } from "~/components/ui/Alert";
import { Heading } from "~/components/ui/Heading";
import { config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { useProjectCount, useProjectsResults, useResults } from "~/hooks/useResults";
import { Layout } from "~/layouts/DefaultLayout";
import { formatNumber } from "~/utils/formatNumber";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

const ResultsChart = dynamic(async () => import("~/features/results/components/Chart"), { ssr: false });

const Stat = ({ title, children = null }: PropsWithChildren<{ title: string }>) => (
  <div className="rounded border p-2">
    <h3 className="font-bold text-gray-500">{title}</h3>

    <div className="text-4xl">{children}</div>
  </div>
);

const Stats = () => {
  const { isLoading, pollData } = useMaci();
  const results = useResults(pollData);
  const count = useProjectCount();
  const { data: projectsResults } = useProjectsResults(pollData);
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
        <h3 className="text-lg font-bold">Connect your wallet to see results</h3>

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
      <h3 className="text-lg font-bold">Top Projects</h3>

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

const StatsPage = (): JSX.Element => {
  const appState = useAppState();
  const duration = config.resultsAt && differenceInDays(config.resultsAt, new Date());

  return (
    <Layout>
      <Heading as="h1" size="3xl">
        Stats
      </Heading>

      {appState === EAppState.RESULTS ? (
        <Stats />
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
