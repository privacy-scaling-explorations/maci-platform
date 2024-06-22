import clsx from "clsx";
import Link from "next/link";

import { InfiniteLoading } from "~/components/InfiniteLoading";
import { useMaci } from "~/contexts/Maci";
import { useResults, useProjectsResults } from "~/hooks/useResults";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import { ProjectItem, ProjectItemAwarded } from "./ProjectItem";

export const ProjectsResults = (): JSX.Element => {
  const { pollData } = useMaci();
  const projects = useProjectsResults(pollData);
  const results = useResults();
  const appState = useAppState();

  return (
    <InfiniteLoading
      {...projects}
      renderItem={(item, { isLoading }) => (
        <Link key={item.id} className={clsx("relative", { "animate-pulse": isLoading })} href={`/projects/${item.id}`}>
          {!results.isLoading && appState === EAppState.RESULTS ? (
            <ProjectItemAwarded amount={results.data?.projects[item.id]?.votes} />
          ) : null}

          <ProjectItem attestation={item} isLoading={isLoading} />
        </Link>
      )}
    />
  );
};
