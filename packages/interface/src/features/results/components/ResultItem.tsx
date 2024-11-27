import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { useProjectMetadata } from "~/features/projects/hooks/useProjects";
import { EMedal, type IRecipientWithVotes } from "~/utils/types";

export interface IResultItemProps {
  pollId: string;
  rank: number;
  project: IRecipientWithVotes;
  medal?: EMedal;
  totalVotes?: number;
}

// devcon round budget
const budget = 250000;

export const ResultItem = ({
  pollId,
  rank,
  project,
  medal = undefined,
  totalVotes = undefined,
}: IResultItemProps): JSX.Element => {
  const metadata = useProjectMetadata(project.metadataUrl);

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
          {medal === EMedal.Gold && <Image alt="gold" height="26" src="/gold.svg" width="26" />}

          {medal === EMedal.Silver && <Image alt="silver" height="26" src="/silver.svg" width="26" />}

          {medal === EMedal.Bronze && <Image alt="bronze" height="26" src="/bronze.svg" width="26" />}
        </div>

        <div className="w-6 flex-none text-center">{rank}</div>

        <div className="mx-2 flex-1">{metadata.data?.name}</div>

        {totalVotes ? (
          <div className="w-24 flex-none text-end">{`${((budget * project.votes) / totalVotes).toFixed(2)} $`}</div>
        ) : (
          <div className="w-24 flex-none text-end">{`${project.votes} votes`}</div>
        )}
      </div>
    </Link>
  );
};
