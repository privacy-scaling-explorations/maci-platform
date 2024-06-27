import { tv } from "tailwind-variants";

import { createComponent } from "~/components/ui";
import { config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { useAppState } from "~/utils/state";
import { EInfoCardState, EAppState } from "~/utils/types";

import { InfoCard } from "./InfoCard";
import { RoundInfo } from "./RoundInfo";
import { VotingInfo } from "./VotingInfo";

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

export const Info = ({ size, showVotingInfo = false }: InfoProps): JSX.Element => {
  const { votingEndsAt } = useMaci();
  const appState = useAppState();

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

        {steps.map((step) => (
          <InfoCard
            key={step.label}
            end={step.end}
            start={step.start}
            state={defineState({ start: step.start, end: step.end })}
            title={step.label}
          />
        ))}
      </InfoContainer>
    </div>
  );
};

function defineState({ start, end }: { start: Date; end: Date }): EInfoCardState {
  const now = new Date();

  if (end < now) {
    return EInfoCardState.PASSED;
  }

  if (end > now && start < now) {
    return EInfoCardState.ONGOING;
  }

  return EInfoCardState.UPCOMING;
}
