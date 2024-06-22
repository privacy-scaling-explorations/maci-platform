import { type ReactNode } from "react";

import { NameENS } from "~/components/ENS";
import { Heading } from "~/components/ui/Heading";
import { ProjectAvatar } from "~/features/projects/components/ProjectAvatar";
import { ProjectBanner } from "~/features/projects/components/ProjectBanner";
import { type Attestation } from "~/utils/fetchAttestations";
import { suffixNumber } from "~/utils/suffixNumber";

import { useProjectMetadata } from "../hooks/useProjects";

import ProjectContributions from "./ProjectContributions";
import ProjectImpact from "./ProjectImpact";

export interface IProjectDetailsProps {
  action: ReactNode;
  attestation?: Attestation;
}

const ProjectDetails = ({ attestation = undefined, action }: IProjectDetailsProps): JSX.Element => {
  const metadata = useProjectMetadata(attestation?.metadataPtr);

  const { bio, websiteUrl, payoutAddress, fundingSources } = metadata.data ?? {};

  return (
    <div className="relative">
      <div className="sticky left-0 right-0 top-0 z-10 bg-white p-4 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{attestation?.name}</h1>

          {action}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl">
        <ProjectBanner profileId={attestation?.recipient} size="lg" />
      </div>

      <div className="mb-8 flex items-end gap-4">
        <ProjectAvatar className="-mt-20 ml-8" profileId={attestation?.recipient} rounded="full" size="lg" />

        <div>
          <div className="">
            <NameENS address={payoutAddress} />

            <a className="hover:underline" href={websiteUrl} rel="noreferrer" target="_blank">
              {websiteUrl}
            </a>
          </div>
        </div>
      </div>

      <p className="text-2xl">{bio}</p>

      <div>
        <Heading as="h2" size="3xl">
          Impact statements
        </Heading>

        <ProjectContributions isLoading={metadata.isLoading} project={metadata.data} />

        <ProjectImpact isLoading={metadata.isLoading} project={metadata.data} />

        <Heading as="h3" size="2xl">
          Past grants and funding
        </Heading>

        <div className="space-y-4">
          {fundingSources?.map((source) => {
            const type =
              {
                OTHER: "Other",
                RETROPGF_2: "RetroPGF2",
                GOVERNANCE_FUND: "Governance Fund",
                PARTNER_FUND: "Partner Fund",
                REVENUE: "Revenue",
              }[source.type] ?? source.type;
            return (
              <div key={source.type} className="flex items-center gap-4">
                <div className="flex-1 truncate text-xl">{source.description}</div>

                <div className="text-sm tracking-widest text-gray-700 dark:text-gray-400">{type}</div>

                <div className="w-32 text-xl font-medium">{`${suffixNumber(source.amount)} ${source.currency}`}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
