import { format } from "date-fns";
import Image from "next/image";
import { useMemo } from "react";

import { Heading } from "~/components/ui/Heading";
import { useRound } from "~/contexts/Round";
import { LayoutWithSidebar } from "~/layouts/DefaultLayout";
import { useRoundState } from "~/utils/state";
import { ERoundState } from "~/utils/types";

import type { GetServerSideProps } from "next";

interface IResultItem {
  name: string;
  votes: number;
  receiver: string;
}

const exampleLeaderboardItems: IResultItem[] = [
  {
    name: "Project 1",
    votes: 1000,
    receiver: "0xBB00B71E34Df590847060A4c597821Bad585ED6d",
  },
  {
    name: "Project 2",
    votes: 500,
    receiver: "0xBB00B71E34Df590847060A4c597821Bad585ED6d",
  },
  {
    name: "Project 3",
    votes: 100,
    receiver: "0xBB00B71E34Df590847060A4c597821Bad585ED6d",
  },
];

interface IPayoutPageProps {
  roundId: string;
}

const PayoutPage = ({ roundId }: IPayoutPageProps): JSX.Element => {
  const roundState = useRoundState(roundId);
  const { getRoundByRoundId } = useRound();
  const round = useMemo(() => getRoundByRoundId(roundId), [roundId, getRoundByRoundId]);

  return (
    <LayoutWithSidebar showInfo roundId={roundId} sidebar="left">
      {roundState === ERoundState.RESULTS && (
        <div className="flex flex-col gap-2">
          <Heading as="h3" size="3xl">
            Leaderboard
          </Heading>

          <p className="flex gap-1 text-gray-400">
            <span>{round?.startsAt ? format(round.startsAt, "d MMM yyyy") : "undefined"}</span>

            <span>-</span>

            <span>{round?.votingEndsAt ? format(round.votingEndsAt, "d MMM yyyy") : "undefined"}</span>
          </p>

          <div className="rounded-md border border-gray-200 p-5">
            {exampleLeaderboardItems.map((item, i) => (
              <div key={item.name} className="flex leading-8">
                <div className="my-1 w-8 flex-none justify-center">
                  {i === 0 && <Image alt="gold" height="26" src="/gold.svg" width="26" />}

                  {i === 1 && <Image alt="silver" height="26" src="/silver.svg" width="26" />}

                  {i === 2 && <Image alt="bronze" height="26" src="/bronze.svg" width="26" />}
                </div>

                <div className="w-6 flex-none text-center">{i}</div>

                <div className="mx-2 flex-1">{item.name}</div>

                <div className="w-8 flex-none">{item.votes}</div>
              </div>
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

export default PayoutPage;

export const getServerSideProps: GetServerSideProps = async ({ query: { roundId } }) =>
  Promise.resolve({
    props: { roundId },
  });
