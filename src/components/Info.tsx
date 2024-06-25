import { tv } from "tailwind-variants";

import { createComponent } from "~/components/ui";
import { EInfoCardState } from "~/utils/types";
import { useMaci } from "~/contexts/Maci";
import { config } from "~/config";
import { getAppState } from "~/utils/state";
import { EAppState } from "~/utils/types";

import { RoundInfo } from "./RoundInfo";
import { VotingInfo } from "./VotingInfo";
import { InfoCard } from "./InfoCard";

const InfoContainer = createComponent(
  "div",
  tv({
    base: "flex items-center justify-center gap-2 rounded-lg bg-white p-5 shadow-lg",
    variants: {
      size: {
        sm: "flex-col",
        default: "flex-col max-lg:w-full lg:flex-row",
      },
    },
  }),
);

interface InfoProps {
  size: string;
  showVotingInfo?: boolean;
}

export function Info({ size, showVotingInfo }: InfoProps) {
  const { votingEndsAt } = useMaci();
  const appState = getAppState();

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
      <InfoContainer size={size}>
        {showVotingInfo && (
          <div className="w-full">
            <RoundInfo />
            {appState === EAppState.VOTING && <VotingInfo />}
          </div>
        )}
        {steps.map((step, i) => (
          <InfoCard
            key={i}
            state={defineState({ start: step.start, end: step.end })}
            title={step.label}
            start={step.start}
            end={step.end}
          />
        ))}
      </InfoContainer>
    </div>
  );
}

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
