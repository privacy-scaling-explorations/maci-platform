import clsx from "clsx";
import { XIcon } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";

import { InfiniteLoading } from "~/components/InfiniteLoading";
import { SortFilter } from "~/components/SortFilter";
import { Alert } from "~/components/ui/Alert";
import { Button } from "~/components/ui/Button";
import { config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { useResults } from "~/hooks/useResults";
import { useAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import { useSearchProjects } from "../hooks/useProjects";
import { useSelectProjects } from "../hooks/useSelectProjects";

import { ProjectItem, ProjectItemAwarded } from "./ProjectItem";
import { ProjectSelectButton } from "./ProjectSelectButton";

export const Projects = (): JSX.Element => {
  const projects = useSearchProjects();
  const select = useSelectProjects();
  const appState = useAppState();
  const { isRegistered, pollData } = useMaci();
  const results = useResults(pollData);

  const handleAdd = useCallback(() => {
    select.add();
  }, [select]);

  const handleReset = useCallback(() => {
    select.reset();
  }, [select]);

  return (
    <div>
      {select.count > config.voteLimit && (
        <Alert variant="warning">
          You have exceeded your vote limit. You can only vote for {config.voteLimit} options.
        </Alert>
      )}

      <div
        className={clsx("sticky top-4 z-20 mb-4 mt-4 flex justify-end gap-4 lg:-mt-8", {
          invisible: !select.count,
        })}
      >
        <Button
          className="w-full lg:w-72"
          disabled={!select.count || select.count > config.voteLimit}
          variant="primary"
          onClick={handleAdd}
        >
          Add {select.count} projects to ballot
        </Button>

        <Button size="icon" onClick={handleReset}>
          <XIcon />
        </Button>
      </div>

      <div className="flex justify-end">
        <SortFilter />
      </div>

      <InfiniteLoading
        {...projects}
        renderItem={(item, { isLoading }) => (
          <Link
            key={item.id}
            className={clsx("relative", { "animate-pulse": isLoading })}
            href={`/projects/${item.id}`}
          >
            {isRegistered && !isLoading && appState === EAppState.VOTING ? (
              <div className="absolute right-2 top-[100px] z-10 -mt-2">
                <ProjectSelectButton
                  state={select.getState(item.id)}
                  onClick={(e: Event) => {
                    e.preventDefault();
                    select.toggle(item.id);
                  }}
                />
              </div>
            ) : null}

            {!results.isLoading && appState === EAppState.RESULTS ? (
              <ProjectItemAwarded amount={results.data?.projects[item.id]?.votes} />
            ) : null}

            <ProjectItem attestation={item} isLoading={isLoading} />
          </Link>
        )}
      />
    </div>
  );
};
