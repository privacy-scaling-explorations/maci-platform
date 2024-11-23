import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRound } from "~/contexts/Round";
import { Tally__factory as TallyFactory } from "maci-platform-contracts/typechain-types";

import { useProjectMetadata } from "~/features/projects/hooks/useProjects";
import { publicClient } from "~/utils/accountAbstraction";

import type { IRecipientWithVotes } from "~/utils/types";
import { formatEther, formatUnits, Hex, parseEther } from "viem";
import { type TallyData } from "maci-cli/sdk";

export interface IResultItemProps {
  pollId: string;
  rank: number;
  project: IRecipientWithVotes;
}

export const ResultItem = ({ pollId, rank, project }: IResultItemProps): JSX.Element => {
  const metadata = useProjectMetadata(project.metadataUrl);

  const { getRoundByPollId } = useRound();

  const roundData = useMemo(() => getRoundByPollId(pollId), [getRoundByPollId, pollId]);

  const [amount, setAmount] = useState<string>("");

  const [tallyData, setTallyData] = useState<TallyData | undefined>(undefined);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_TALLY_URL + `/tally-${pollId}.json`)
      .then((res) => res.json() as Promise<TallyData>)
      .then((res) => {
        setTallyData(res);
      })
      .catch(() => undefined);
  }, [roundData])

  useEffect(() => {
    const getAmount = async () => {
      if (!tallyData?.perVOSpentVoiceCredits || !roundData?.tallyAddress) {
        console.log("no tally data or tally address");
        return;
      }

      // 250k with 18 decimals
      const budget = BigInt(parseEther("250000"));
      console.log("budget", budget);

      const totalSpent = await publicClient.readContract({
        address: roundData.tallyAddress as Hex,
        abi: TallyFactory.abi,
        functionName: "totalSpent",
      });

      console.log("total spent", totalSpent);

      const totalVotesSquares = (await publicClient.readContract({
        address: roundData.tallyAddress as Hex,
        abi: TallyFactory.abi,
        functionName: "totalVotesSquares",
      })) + 100n;

      console.log("totalVotesSquares", totalVotesSquares);

      // everyone got the same amount of voice credits = 1000
      const maxVoiceCredits = BigInt(1000);

      const voiceCreditFactor = BigInt(10e6) * BigInt(10e18) / maxVoiceCredits;

      console.log("voiceCreditFactor", voiceCreditFactor);

      const alphaPrecision = BigInt(10e18);

      const contributions = totalSpent * voiceCreditFactor;

      const alpha = ((budget - contributions) * alphaPrecision) / (voiceCreditFactor * (totalVotesSquares - totalSpent));

      const quadratic = alpha * voiceCreditFactor * (BigInt(project.votes) * BigInt(project.votes));
      const totalSpentCredits = voiceCreditFactor * BigInt(tallyData.perVOSpentVoiceCredits.tally[Number.parseInt(project.index, 10)]!);
      const linearPrecision = alphaPrecision * totalSpentCredits;
      const linearAlpha = alpha * totalSpentCredits;

      const amount = (quadratic + linearPrecision - linearAlpha) / alphaPrecision;

      console.log("amount", amount);

      const finalAmount = amount > BigInt(parseEther("30000")) ? BigInt(parseEther("30000")) : amount;

      console.log("final amount", formatUnits(finalAmount, 18));
      setAmount(formatUnits(finalAmount, 18).toString());
    };

    // eslint-disable-next-line no-console
    getAmount().catch(console.error);
  }, [roundData, tallyData, setAmount]);

  useEffect(() => {
    if (metadata.data) {
      return;
    }

    // eslint-disable-next-line no-console
    metadata.refetch().catch(console.error);
  }, [metadata]);

  return (
    <Link href={`/rounds/${pollId}/${project.id}`}>
      <div className="flex cursor-pointer leading-8 hover:bg-blue-50">
        <div className="my-1 w-8 flex-none justify-center">
          {rank === 1 && <Image alt="gold" height="26" src="/gold.svg" width="26" />}

          {rank === 2 && <Image alt="silver" height="26" src="/silver.svg" width="26" />}

          {rank === 3 && <Image alt="bronze" height="26" src="/bronze.svg" width="26" />}
        </div>

        <div className="w-6 flex-none text-center">{rank}</div>

        <div className="mx-2 flex-1">{metadata.data?.name}</div>

        {amount ? (
          <div className="w-24 flex-none text-end">{`${amount} USD`}</div>
        ) : (
          <div className="w-24 flex-none text-end">{`${project.votes} votes`}</div>
        )}
      </div>
    </Link>
  );
};
