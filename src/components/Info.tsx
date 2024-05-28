import { clsx } from "clsx";
import { format } from "date-fns";
import Image from "next/image";

import { EInfoCardState } from "~/utils/types";
import { useMaci } from "~/contexts/Maci";
import { config } from "~/config";

export function Info() {
  const { votingEndsAt } = useMaci();

  const steps = [
    {
      label: "application",
      start: config.startsAt,
      end: config.registrationEndsAt,
    },
    {
      label: "voting",
      start: config.registrationEndsAt,
      end: votingEndsAt,
    },
    {
      label: "tallying",
      start: votingEndsAt,
      end: config.resultsAt,
    },
    {
      label: "results",
      start: config.resultsAt,
      end: config.resultsAt,
    },
  ];

  return (
    <div className="w-full">
      <div className="my-8 flex flex-col items-center justify-center gap-2 rounded-lg bg-white p-5 shadow-sm max-lg:w-full lg:flex-row">
        {steps.map((step, i) => (
          <InfoCard
            key={i}
            state={defineState({ start: step.start, end: step.end })}
            title={step.label}
            start={step.start}
            end={step.end}
          />
        ))}
      </div>
    </div>
  );
}

const InfoCard = ({
  state,
  title,
  start,
  end,
}: {
  state: EInfoCardState;
  title: string;
  start: Date;
  end: Date;
}) => {
  return (
    <div
      className={clsx("rounded-md p-4 max-lg:w-full lg:w-64", {
        ["border border-blue-500 bg-blue-50 text-blue-500"]:
          state === EInfoCardState.PASSED,
        ["border border-blue-500 bg-blue-500 text-white"]:
          state === EInfoCardState.ONGOING,
        ["border border-gray-200 bg-transparent text-gray-200"]:
          state === EInfoCardState.UPCOMING,
      })}
    >
      <div className="flex items-center justify-between">
        <h3 className="uppercase">{title}</h3>
        {state === EInfoCardState.PASSED ? (
          <Image alt="" width="20" height="20" src="circle-check-blue.svg" />
        ) : state == EInfoCardState.ONGOING ? (
          <div className="h-4 w-4 rounded-full bg-green"></div>
        ) : (
          <div className="h-4 w-4 rounded-full border-2 border-gray-200 bg-transparent"></div>
        )}
      </div>
      <p>{formatDateString({ start, end })}</p>
    </div>
  );
};

function defineState({
  start,
  end,
}: {
  start: Date;
  end: Date;
}): EInfoCardState {
  const now = new Date();

  if (end < now) return EInfoCardState.PASSED;
  else if (end > now && start < now) return EInfoCardState.ONGOING;
  else return EInfoCardState.UPCOMING;
}

function formatDateString({ start, end }: { start: Date; end: Date }): string {
  const fullFormat = "d MMM yyyy";

  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    return `${start.getDate()} - ${format(end, fullFormat)}`;
  } else if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d MMM")} - ${format(end, fullFormat)}`;
  } else {
    return `${format(start, fullFormat)} - ${format(end, fullFormat)}`;
  }
}
