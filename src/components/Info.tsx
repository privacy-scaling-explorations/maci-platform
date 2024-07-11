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
      state: EAppState.APPLICATION,
      start: config.startsAt,
      end: config.registrationEndsAt,
    },
    {
      label: "voting",
      state: EAppState.VOTING,
      start: config.registrationEndsAt,
      end: votingEndsAt,
    },
    {
      label: "tallying",
      state: EAppState.TALLYING,
      start: votingEndsAt,
      end: config.resultsAt,
    },
    {
      label: "results",
      state: EAppState.RESULTS,
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

        {steps.map(
          (step) =>
            step.start &&
            step.end && (
              <InfoCard
                key={step.label}
                end={step.end}
                start={step.start}
                state={defineState({ state: step.state, appState })}
                title={step.label}
              />
            ),
        )}
      </InfoContainer>
    </div>
  );
};

function defineState({ state, appState }: { state: EAppState; appState: EAppState }): EInfoCardState {
  const statesOrder = [EAppState.APPLICATION, EAppState.VOTING, EAppState.TALLYING, EAppState.RESULTS];
  const currentStateOrder = statesOrder.indexOf(state);
  const appStateOrder = statesOrder.indexOf(appState);

  if (currentStateOrder < appStateOrder) {
    return EInfoCardState.PASSED;
  }

  if (currentStateOrder === appStateOrder) {
    return EInfoCardState.ONGOING;
  }

  return EInfoCardState.UPCOMING;
}
