import clsx from "clsx";
import { Trash } from "lucide-react";
import Link from "next/link";
import { type UseFormReturn, useFieldArray, useFormContext } from "react-hook-form";
import { tv } from "tailwind-variants";

import { createComponent } from "~/components/ui";
import { IconButton } from "~/components/ui/Button";
import { FormControl, Input } from "~/components/ui/Form";
import { Table, Tbody, Tr, Td } from "~/components/ui/Table";
import { config } from "~/config";
import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";
import { ProjectAvatar } from "~/features/projects/components/ProjectAvatar";
import { useProjectById } from "~/features/projects/hooks/useProjects";
import { formatNumber } from "~/utils/formatNumber";

import type { ReactNode } from "react";

import { type Vote } from "../types";

import { AllocationInput } from "./AllocationInput";

const AllocationListWrapper = createComponent("div", tv({ base: "flex flex-col gap-2 flex-1" }));

export interface IAllocationListProps {
  votes?: Vote[];
}

export interface IProjectAvatarWithNameProps {
  id?: string;
  link?: boolean;
  subtitle?: string;
}

export const ProjectAvatarWithName = ({
  id = "",
  subtitle = "",
  link = false,
}: IProjectAvatarWithNameProps): JSX.Element => {
  const { data: projects } = useProjectById(id);
  const project = projects?.[0];
  const Component = link ? Link : "div";

  return (
    <Component
      className={clsx("flex flex-1 items-center gap-2 py-1 ", {
        "hover:underline": link,
      })}
      href={`/projects/${id}`}
      tabIndex={-1}
    >
      <ProjectAvatar profileId={project?.recipient} rounded="full" size="sm" />

      <div>
        <div className="font-bold">{project?.name}</div>

        <div className="text-muted">{subtitle}</div>
      </div>
    </Component>
  );
};

export const AllocationList = ({ votes = [] }: IAllocationListProps): JSX.Element => (
  <AllocationListWrapper>
    <Table>
      <Tbody>
        {votes.map((project) => (
          <Tr key={project.projectId}>
            <Td className="w-full">
              <ProjectAvatarWithName link id={project.projectId} />
            </Td>

            <Td className="whitespace-nowrap text-right">{`${formatNumber(project.amount)} ${config.tokenName}`}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </AllocationListWrapper>
);

interface AllocationFormProps {
  disabled?: boolean;
  projectIsLink?: boolean;
  renderHeader?: () => ReactNode;
  renderExtraColumn?: (
    { form, project }: { form: UseFormReturn<{ votes: Vote[] }>; project: Vote },
    i: number,
  ) => ReactNode;
}

export const AllocationFormWrapper = ({
  disabled = false,
  projectIsLink = false,
  renderHeader = undefined,
  renderExtraColumn = undefined,
}: AllocationFormProps): JSX.Element => {
  const form = useFormContext<{ votes: Vote[] }>();
  const { initialVoiceCredits, pollId } = useMaci();
  const { addToBallot: onSave, removeFromBallot: onRemove } = useBallot();

  const { fields, remove } = useFieldArray({
    name: "votes",
    keyName: "key",
    control: form.control,
  });

  return (
    <AllocationListWrapper>
      <Table>
        {renderHeader?.()}

        <Tbody>
          {fields.map((project, i) => {
            const idx = i;

            return (
              <Tr key={project.projectId}>
                <Td className="w-full">
                  <ProjectAvatarWithName id={project.projectId} link={projectIsLink} />
                </Td>

                <Td>{renderExtraColumn?.({ project, form }, i)}</Td>

                <Td>
                  <AllocationInput
                    defaultValue={project.amount}
                    disabled={disabled}
                    name={`votes.${idx}.amount`}
                    votingMaxProject={initialVoiceCredits}
                    onBlur={() => {
                      onSave(form.getValues().votes, pollId!);
                    }}
                  />
                </Td>

                <Td>
                  <IconButton
                    disabled={disabled}
                    icon={Trash}
                    tabIndex={-1}
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      remove(idx);
                      onRemove(project.projectId);
                    }}
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </AllocationListWrapper>
  );
};

export const DistributionForm = ({ ...props }: AllocationFormProps): JSX.Element => (
  <AllocationFormWrapper
    {...props}
    renderExtraColumn={(_, i) => (
      <FormControl className="mb-0" name={`votes.${i}.payoutAddress`}>
        <Input className="min-w-64 font-mono" />
      </FormControl>
    )}
  />
);
