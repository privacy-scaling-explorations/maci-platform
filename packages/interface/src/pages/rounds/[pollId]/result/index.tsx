import { format } from "date-fns";
import Image from "next/image";
import { useMemo, useEffect } from "react";
import { Hex, zeroAddress } from "viem";

import { Heading } from "~/components/ui/Heading";
import { useRound } from "~/contexts/Round";
import { ResultItem } from "~/features/results/components/ResultItem";
import { useProjectsResults } from "~/hooks/useResults";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { GetServerSideProps } from "next";

interface IResultPageProps {
  pollId: string;
}

const ResultPage = ({ pollId }: IResultPageProps): JSX.Element => {
  const { getRoundByPollId } = useRound();
  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);

  const projectsResults = useProjectsResults(
    (round?.registryAddress ?? zeroAddress) as Hex,
    (round?.tallyAddress ?? zeroAddress) as Hex,
  );

  const roundState = useRoundState({ pollId });

  useEffect(() => {
    if (projectsResults.data) {
      return;
    }

    // eslint-disable-next-line no-console
    projectsResults.refetch().catch(console.error);
  }, [projectsResults, round]);

  return (
    <LayoutWithSidebar showInfo pollId={pollId} sidebar="left">
      {roundState === ERoundState.RESULTS && (
        <div className="flex flex-col gap-[30px]">
          <div className="flex flex-col gap-[10px]">
            <Heading as="h3" className="!text-[36px] !leading-[54px]" size="3xl">
              Leaderboard
            </Heading>

            <span className="flex gap-1 font-sans text-base text-gray-400">
              <span>{round?.startsAt ? format(round.startsAt, "d MMM yyyy") : "undefined"}</span>

              <span>-</span>

              <span>{round?.votingEndsAt ? format(round.votingEndsAt, "d MMM yyyy") : "undefined"}</span>
            </span>
          </div>

          <div className="rounded-lg border border-gray-200 p-[10px]">
            {projectsResults.data?.map((item, i) => (
              <ResultItem key={item.index} pollId={pollId} project={item} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {roundState !== ERoundState.RESULTS && (
        <div className="mt-32 flex w-full flex-col items-center justify-center text-center dark:text-white">
          <Image alt="line-chart" height="85" src="/line-chart.svg" width="85" />

          <Heading size="lg">Results will be available after tallying.</Heading>

          <p className="text-gray-400">{round?.votingEndsAt && format(round.votingEndsAt, "d MMM yyyy")}</p>
        </div>
      )}
    </LayoutWithSidebar>
  );
};

export default ResultPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { pollId } }) =>
  Promise.resolve({
    props: { pollId },
  });
