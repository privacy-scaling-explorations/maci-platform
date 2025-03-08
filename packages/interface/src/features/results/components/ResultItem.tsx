import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { useProjectMetadata } from "~/features/projects/hooks/useProjects";

import type { IRecipientWithVotes } from "~/utils/types";

export interface IResultItemProps {
  pollId: string;
  rank: number;
  project: IRecipientWithVotes;
}

export const ResultItem = ({ pollId, rank, project }: IResultItemProps): JSX.Element => {
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
      <div className="flex cursor-pointer gap-[14px] overflow-hidden rounded p-[10px] leading-8 duration-200 hover:bg-blue-50 dark:hover:bg-blue-50/10">
        <div className="flex flex-none items-center justify-center gap-2 text-center font-sans text-base font-semibold text-black dark:text-white">
          <span className="w-3">{rank}</span>

          <div className="w-4">
            {rank === 1 && <Image alt="gold" height="26" src="/gold.svg" width="20" />}

            {rank === 2 && <Image alt="silver" height="26" src="/silver.svg" width="20" />}

            {rank === 3 && <Image alt="bronze" height="26" src="/bronze.svg" width="20" />}
          </div>
        </div>

        <div className="flex-1 font-sans text-lg font-medium leading-[28px] dark:text-white">{metadata.data?.name}</div>

        <div className="flex-none text-end font-sans text-base font-normal text-black dark:text-white">{`${project.votes} votes`}</div>
      </div>
    </Link>
  );
};
