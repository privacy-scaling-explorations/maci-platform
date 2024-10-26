import { useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { HiOutlineTrash } from "react-icons/hi";
import { Hex } from "viem";

import { IconButton } from "~/components/ui/Button";
import { Table, Tbody, Tr, Td } from "~/components/ui/Table";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { useRound } from "~/contexts/Round";

import type { Vote } from "../types";
import type { ReactNode } from "react";

import { AllocationInput } from "./AllocationInput";
import { ProjectAvatarWithName } from "./ProjectAvatarWithName";

interface AllocationFormProps {
  pollId: string;
  disabled?: boolean;
  projectIsLink?: boolean;
  renderHeader?: () => ReactNode;
}

export const AllocationFormWrapper = ({
  pollId,
  disabled = false,
  projectIsLink = false,
  renderHeader = undefined,
}: AllocationFormProps): JSX.Element => {
  const form = useFormContext<{ votes: Vote[] }>();
  const { initialVoiceCredits } = useMaci();
  const { addToBallot: onSave, removeFromBallot: onRemove } = useBallot();
  const { getRoundByPollId } = useRound();

  const { fields, remove } = useFieldArray({
    name: "votes",
    keyName: "key",
    control: form.control,
  });

  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);

  return (
    <Table>
      {renderHeader?.()}

      <Tbody>
        {fields.map((project, i) => (
          <Tr key={project.projectId} className={projectIsLink && "hover:shadow-md"}>
            <Td className="w-full" variant="first">
              <ProjectAvatarWithName
                showDescription
                id={project.projectId}
                isLink={projectIsLink}
                pollId={pollId}
                registryAddress={round?.registryAddress as Hex}
              />
            </Td>

            <Td className="pl-0 pr-0 sm:pl-2">
              <AllocationInput
                defaultValue={project.amount}
                disabled={disabled}
                name={`votes.${i}.amount`}
                votingMaxProject={initialVoiceCredits}
                onBlur={() => {
                  onSave(form.getValues().votes, round?.pollId ?? "");
                }}
              />
            </Td>

            <Td className="pl-0" variant="last">
              <IconButton
                className="dark:text-white"
                disabled={disabled}
                icon={HiOutlineTrash}
                tabIndex={-1}
                type="button"
                variant="none"
                onClick={() => {
                  remove(i);
                  onRemove(project.projectIndex, round?.pollId ?? "");
                }}
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
