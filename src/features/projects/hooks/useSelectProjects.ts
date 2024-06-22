import { useMemo, useState } from "react";

import { useBallot } from "~/contexts/Ballot";
import { useMaci } from "~/contexts/Maci";

export interface IUseSelectProjectsReturn {
  count: number;
  add: () => void;
  reset: () => void;
  toggle: (id: string) => void;
  getState: (id: string) => 0 | 1 | 2;
}

export function useSelectProjects(): IUseSelectProjectsReturn {
  const { addToBallot, ballotContains } = useBallot();
  const { pollId } = useMaci();

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toAdd = useMemo(
    () =>
      Object.keys(selected)
        .filter((id) => selected[id])
        .map((projectId) => ({ projectId, amount: 0 })),
    [selected],
  );

  return {
    count: toAdd.length,
    // isLoading: add.isPending,
    add: () => {
      addToBallot(toAdd, pollId!);
      setSelected({});
    },
    reset: () => {
      setSelected({});
    },
    toggle: (id: string) => {
      if (!id) {
        return;
      }

      setSelected((s) => ({ ...s, [id]: !selected[id] }));
    },
    getState: (id: string) => {
      if (ballotContains(id)) {
        return 2;
      }

      return selected[id] ? 1 : 0;
    },
  };
}
