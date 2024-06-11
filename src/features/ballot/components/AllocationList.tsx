import type { ReactNode } from "react";
import { HiOutlineTrash } from "react-icons/hi";

import { Table, Tbody, Tr, Td } from "~/components/ui/Table";
import { formatNumber } from "~/utils/formatNumber";
import { useFieldArray, useFormContext } from "react-hook-form";
import { AllocationInput } from "./AllocationInput";
import { IconButton } from "~/components/ui/Button";
import { type Vote } from "../types";

import { useMaci } from "~/contexts/Maci";
import { useBallot } from "~/contexts/Ballot";
import { config } from "~/config";
import { ProjectAvatarWithName } from "./ProjectAvatarWithName";

export const AllocationList = ({ votes }: { votes?: Vote[] }) => {
  return (
    <Table>
      <Tbody>
        {votes?.map((project) => (
          <Tr key={project.projectId}>
            <Td className={"w-full"}>
              <ProjectAvatarWithName isLink id={project.projectId} />
            </Td>
            <Td className="whitespace-nowrap text-right">
              {formatNumber(project.amount)} {config.tokenName}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

type AllocationFormProps = {
  renderHeader?: () => ReactNode;
  disabled?: boolean;
  projectIsLink?: boolean;
};

export function AllocationFormWrapper({
  disabled,
  projectIsLink,
  renderHeader,
}: AllocationFormProps) {
  const form = useFormContext<{ votes: Vote[] }>();
  const { initialVoiceCredits, pollId } = useMaci();
  const { addToBallot: onSave, removeFromBallot: onRemove } = useBallot();

  const { fields, remove } = useFieldArray({
    name: "votes",
    keyName: "key",
    control: form.control,
  });

  return (
    <Table>
      {renderHeader?.()}
      <Tbody>
        {fields.map((project, i) => {
          return (
            <Tr
              key={project.projectId}
              className={projectIsLink && "hover:shadow-md"}
            >
              <Td className="w-full" variant="first">
                <ProjectAvatarWithName
                  id={project.projectId}
                  isLink={projectIsLink}
                  showDescription
                />
              </Td>
              <Td className="pr-0">
                <AllocationInput
                  name={`votes.${i}.amount`}
                  disabled={disabled}
                  defaultValue={project.amount}
                  votingMaxProject={initialVoiceCredits}
                  onBlur={() => onSave?.(form.getValues().votes, pollId)}
                />
              </Td>
              <Td variant="last" className="pl-0">
                <IconButton
                  tabIndex={-1}
                  type="button"
                  variant="ghost"
                  icon={HiOutlineTrash}
                  disabled={disabled}
                  onClick={() => {
                    remove(i);
                    onRemove?.(project.projectId);
                  }}
                />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
