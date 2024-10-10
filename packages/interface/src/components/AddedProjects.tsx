import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { useProjectCount } from "~/features/projects/hooks/useProjects";

export const AddedProjects = (): JSX.Element => {
  const { ballot } = useBallot();
  const { pollData } = useMaci();
  const { chain } = useAccount();
  const { data: projectCount } = useProjectCount({ registryAddress: pollData?.registry ?? zeroAddress, chain: chain! });

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
