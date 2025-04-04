import { useMemo } from "react";
import { Hex, zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { useBallot } from "~/contexts/Ballot";
import { useRound } from "~/contexts/Round";
import { useProjectCount } from "~/features/projects/hooks/useProjects";

interface IAddedProjectsProps {
  pollId: string;
}

export const AddedProjects = ({ pollId }: IAddedProjectsProps): JSX.Element => {
  const { getBallot } = useBallot();
  const { chain } = useAccount();
  const { getRoundByPollId } = useRound();

  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);

  const { data: projectCount } = useProjectCount({
    registryAddress: (round?.registryAddress ?? zeroAddress) as Hex,
    chain: chain!,
  });

  const ballot = useMemo(() => getBallot(pollId), [pollId, getBallot]);

  return (
    <div className="border-b border-gray-200 py-2">
      <h4 className="font-sans text-base font-normal uppercase text-gray-400">Projects Added</h4>

      <div className="flex gap-1 font-sans text-2xl font-extrabold">
        <span>
          <b>{ballot.votes.length}</b>
        </span>

        <span className="text-gray-300">{`of ${projectCount?.count.toString()}`}</span>
      </div>
    </div>
  );
};
