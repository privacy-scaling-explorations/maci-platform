import { Hex } from "viem";

import { Table, Tbody, Tr, Td } from "~/components/ui/Table";
import { config } from "~/config";
import { formatNumber } from "~/utils/formatNumber";

import type { Vote } from "../types";

import { ProjectAvatarWithName } from "./ProjectAvatarWithName";

interface IAllocationListProps {
  votes: Vote[];
  pollId: string;
  registryAddress: Hex;
}

export const AllocationList = ({ votes, pollId, registryAddress }: IAllocationListProps): JSX.Element => (
  <Table>
    <Tbody>
      {votes.map((project) => (
        <Tr key={project.projectId}>
          <Td className="w-full">
            <ProjectAvatarWithName isLink id={project.projectId} pollId={pollId} registryAddress={registryAddress} />
          </Td>

          <Td className="whitespace-nowrap text-right">{`${formatNumber(project.amount)} ${config.tokenName}`}</Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);
