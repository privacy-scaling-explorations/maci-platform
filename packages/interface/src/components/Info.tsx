import { useRouter } from "next/router";
import { tv } from "tailwind-variants";

import { createComponent } from "~/components/ui";
import { useRound } from "~/contexts/Round";
import { useRoundState } from "~/utils/state";
import { EInfoCardState, ERoundState } from "~/utils/types";

import { BallotOverview } from "./BallotOverview";
import { InfoCard } from "./InfoCard";
import { RoundInfo } from "./RoundInfo";
import { VotingInfo } from "./VotingInfo";

const InfoContainer = createComponent(
  "div",
  tv({
    base: "flex justify-center gap-2 rounded-lg bg-white p-5 shadow-lg dark:bg-lightBlack",
    variants: {
      size: {
        sm: "flex-col",
        default: "flex-col max-lg:w-full xl:flex-row xl:w-fit",
      },
    },
  }),
);

interface IInfoProps {
  size: string;
  pollId: string;
  showRoundInfo?: boolean;
  showAppState?: boolean;
  showBallot?: boolean;
}

export const Info = ({
  size,
  pollId,
  showRoundInfo = false,
  showAppState = false,
  showBallot = false,
}: IInfoProps): JSX.Element => {
  const roundState = useRoundState({ pollId });

  const { getRoundByPollId } = useRound();
  const round = getRoundByPollId(pollId);
  const { asPath } = useRouter();

  const steps = [
    {
      label: "application",
      state: ERoundState.APPLICATION,
      start: round?.startsAt ? new Date(round.startsAt) : new Date(),
      end: round?.registrationEndsAt ? new Date(round.registrationEndsAt) : new Date(),
    },
    {
      label: "voting",
      state: ERoundState.VOTING,
      start: round?.registrationEndsAt ? new Date(round.registrationEndsAt) : new Date(),
      end: round?.votingEndsAt ? new Date(round.votingEndsAt) : new Date(),
    },
    {
      label: "tallying",
      state: ERoundState.TALLYING,
      start: round?.votingEndsAt ? new Date(round.votingEndsAt) : new Date(),
      end: round?.votingEndsAt ? new Date(round.votingEndsAt) : new Date(),
    },
    {
      label: "results",
      state: ERoundState.RESULTS,
      start: round?.votingEndsAt ? new Date(round.votingEndsAt) : new Date(),
      end: round?.votingEndsAt ? new Date(round.votingEndsAt) : new Date(),
    },
  ];

  return (
    <div className="flex w-full justify-center pb-3">
      <InfoContainer size={size}>
        {showRoundInfo && <RoundInfo roundId={round?.roundId ?? ""} />}

        {showBallot && <BallotOverview pollId={pollId} title={asPath.includes("ballot") ? "Summary" : undefined} />}

        {showRoundInfo && roundState === ERoundState.VOTING && <VotingInfo pollId={pollId} />}

        {showAppState &&
          steps.map((step) => (
            <InfoCard
              key={step.label}
              end={step.end}
              start={step.start}
              state={defineState({ state: step.state, roundState })}
              title={step.label}
            />
          ))}
      </InfoContainer>
    </div>
  );
};

function defineState({ state, roundState }: { state: ERoundState; roundState: ERoundState }): EInfoCardState {
  const statesOrder = [ERoundState.APPLICATION, ERoundState.VOTING, ERoundState.TALLYING, ERoundState.RESULTS];
  const currentStateOrder = statesOrder.indexOf(state);
  const appStateOrder = statesOrder.indexOf(roundState);

  if (currentStateOrder < appStateOrder) {
    return EInfoCardState.PASSED;
  }

  if (currentStateOrder === appStateOrder) {
    return EInfoCardState.ONGOING;
  }

  return EInfoCardState.UPCOMING;
}
