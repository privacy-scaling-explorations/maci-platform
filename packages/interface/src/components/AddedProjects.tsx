import { useMemo } from "react";
import { Hex, zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { useBallot } from "~/contexts/Ballot";
import { useRound } from "~/contexts/Round";
import { useProjectCount } from "~/features/projects/hooks/useProjects";

interface IAddedProjectsProps {
  roundId: string;
}

export const AddedProjects = ({ roundId }: IAddedProjectsProps): JSX.Element => {
  const { ballot } = useBallot();
  const { chain } = useAccount();
  const { getRoundByRoundId } = useRound();

  const round = useMemo(() => getRoundByRoundId(roundId), [roundId, getRoundByRoundId]);

  const { data: projectCount } = useProjectCount({
    registryAddress: (round?.registryAddress ?? zeroAddress) as Hex,
    chain: chain!,
  });

  const allocations = ballot.votes;

  return (
    <div className="border-b border-gray-200 py-2">
      <h4>Projects Added</h4>

      <div className="mt-2 flex gap-2 text-2xl">
        <span>
          <b>{allocations.length}</b>
        </span>

        <span className="text-gray-300">
          <b>of</b>
        </span>

        <span className="text-gray-300">
          <b>{projectCount?.count.toString()}</b>
        </span>
      </div>
    </div>
  );
};
