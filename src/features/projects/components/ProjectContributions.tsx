import { FileCode, Github, Globe, type LucideIcon } from "lucide-react";
import { createElement } from "react";

import { Heading } from "~/components/ui/Heading";
import { Markdown } from "~/components/ui/Markdown";
import { type Application } from "~/features/applications/types";

import { LinkBox } from "./LinkBox";

interface IProjectContributionsProps {
  isLoading: boolean;
  project?: Application;
}

const ProjectContributions = ({ isLoading, project = undefined }: IProjectContributionsProps): JSX.Element => (
  <>
    <Heading as="h3" size="2xl">
      Contributions
    </Heading>

    <div className="mb-4 gap-4 md:flex">
      <div className="md:w-2/3">
        <Markdown isLoading={isLoading}>{project?.contributionDescription}</Markdown>
      </div>

      <div className="md:w-1/3">
        <LinkBox
          label="Contribution Links"
          links={project?.contributionLinks}
          renderItem={(link) => {
            const icon: LucideIcon | undefined = {
              CONTRACT_ADDRESS: FileCode,
              GITHUB_REPO: Github,
              OTHER: Globe,
            }[link.type];
            return (
              <>
                {createElement(icon ?? "div", {
                  className: "w-4 h-4 mt-1",
                })}

                <div className="flex-1 truncate" title={link.description}>
                  {link.description}
                </div>
              </>
            );
          }}
        />
      </div>
    </div>
  </>
);

export default ProjectContributions;
