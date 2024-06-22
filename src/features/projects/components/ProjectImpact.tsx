import { Heading } from "~/components/ui/Heading";
import { Markdown } from "~/components/ui/Markdown";
import { type Application } from "~/features/applications/types";
import { suffixNumber } from "~/utils/suffixNumber";

import { LinkBox } from "./LinkBox";

interface IProjectImpactProps {
  isLoading: boolean;
  project?: Application;
}

const ProjectImpact = ({ isLoading, project = undefined }: IProjectImpactProps): JSX.Element => (
  <>
    <Heading as="h3" size="2xl">
      Impact
    </Heading>

    <div className="flex gap-4">
      <div className="md:w-2/3">
        <Markdown isLoading={isLoading}>{project?.impactDescription}</Markdown>
      </div>

      <div className="md:w-1/3">
        <LinkBox
          label="Impact Metrics"
          links={project?.impactMetrics}
          renderItem={(link) => (
            <>
              <div className="flex-1 truncate" title={link.description}>
                {link.description}
              </div>

              <div className="font-medium">{suffixNumber(link.number)}</div>
            </>
          )}
        />
      </div>
    </div>
  </>
);

export default ProjectImpact;
