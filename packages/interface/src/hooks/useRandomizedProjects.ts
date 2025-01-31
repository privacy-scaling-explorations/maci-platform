import { type InfiniteData } from "@tanstack/react-query";
import { type UseTRPCInfiniteQueryResult } from "@trpc/react-query/shared";
import { useMemo, useState } from "react";

import { IRecipient } from "~/utils/types";

type RandomizedProjectsResult = UseTRPCInfiniteQueryResult<IRecipient[], unknown, unknown>;

export function useRandomizedProjects(projects: RandomizedProjectsResult, pollId: string): RandomizedProjectsResult {
  const [randomSeed] = useState(() => {
    try {
      if (typeof window === "undefined") {
        return Math.random();
      }

      const storedSeed = window.localStorage.getItem(`projectRandomSeed-${pollId}`);
      if (storedSeed) {
        return parseFloat(storedSeed);
      }
      const newSeed = Math.random();
      window.localStorage.setItem(`projectRandomSeed-${pollId}`, newSeed.toString());
      return newSeed;
    } catch {
      return Math.random();
    }
  });

  // @ts-expect-error - this is a temporary fix to allow the randomized projects to be used in the projects component
  return useMemo(() => {
    if (!projects.data) {
      return projects as RandomizedProjectsResult;
    }

    const data = projects.data as InfiniteData<IRecipient[]>;

    return {
      ...projects,
      data: {
        ...data,
        pages: data.pages.map((page) => [...page].sort(() => randomSeed - 0.5)),
      },
    };
  }, [projects, randomSeed]);
}
