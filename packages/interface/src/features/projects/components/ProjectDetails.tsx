import clsx from "clsx";
import { type ReactNode } from "react";

import { Heading } from "~/components/ui/Heading";
import { Navigation } from "~/components/ui/Navigation";
import { VotingWidget } from "~/features/projects/components/VotingWidget";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import type { Attestation } from "~/utils/types";

import { useProjectMetadata } from "../hooks/useProjects";

export interface IProjectDetailsProps {
  action?: ReactNode;
  projectId?: string;
  attestation?: Attestation;
  disabled?: boolean;
}

const ProjectDetails = ({
  projectId = "",
  attestation = undefined,
  action = undefined,
  disabled = false,
}: IProjectDetailsProps): JSX.Element => {
  const metadata = useProjectMetadata(attestation?.metadataPtr);

  const { profileImageUrl } = metadata.data ?? {};

  const appState = useAppState();

  return (
    <div className={clsx("relative dark:text-white", disabled && "opacity-30")}>
      <div className="mb-7">
        <Navigation projectName={attestation?.name ?? "project name"} />
      </div>

      <div className="mb-8 flex max-w-96 items-end gap-4">
        <img alt="meme" src={profileImageUrl} />
      </div>

      <div className="flex items-center justify-between">
        <Heading as="h3" size="3xl">
          {attestation?.name}
        </Heading>

        {appState === EAppState.VOTING && <VotingWidget projectId={projectId} />}
      </div>

      <div className="my-4 flex flex-col gap-2">{action}</div>
    </div>
  );
};

export default ProjectDetails;
