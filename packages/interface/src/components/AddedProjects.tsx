import { useBallot } from "~/contexts/Ballot";
import { useProjectCount } from "~/features/projects/hooks/useProjects";

interface IAddedProjectsProps {
  roundId: string;
}

export const AddedProjects = ({ roundId }: IAddedProjectsProps): JSX.Element => {
  const { ballot } = useBallot();
  const allocations = ballot.votes;
  const { data: projectCount } = useProjectCount(roundId);

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
          <b>{projectCount?.count}</b>
        </span>
      </div>
    </div>
  );
};
