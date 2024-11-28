import { useAccount } from "wagmi";

import ConnectButton from "~/components/ConnectButton";
import { Info } from "~/components/Info";
import { JoinButton } from "~/components/JoinButton";
import { Button } from "~/components/ui/Button";
import { Heading } from "~/components/ui/Heading";
import { useMaci } from "~/contexts/Maci";
import { useIsMobile } from "~/hooks/useIsMobile";
import { useRoundState } from "~/utils/state";
import { ERoundState, type IRoundData } from "~/utils/types";

interface ISingleRoundHomeProps {
  round: IRoundData;
}

export const SingleRoundHome = ({ round }: ISingleRoundHomeProps): JSX.Element => {
  const { isConnected } = useAccount();
  const { isRegistered } = useMaci();
  const isMobile = useIsMobile();
  const roundState = useRoundState({ pollId: round.pollId });

  return (
    <div className="flex h-auto w-screen flex-col items-center justify-center gap-4 bg-blue-50 px-2 pb-4 sm:h-[90vh] dark:bg-black">
      <Heading className="mb-0 mt-4 max-w-screen-lg text-center sm:mt-0" size="6xl">
        {round.roundId}
      </Heading>

      <p className="text-gray-400">{round.description}</p>

      <Button size="auto" variant={roundState === ERoundState.RESULTS ? "tertiary" : "secondary"}>
        <a href={`/rounds/${round.pollId}`}>View Projects</a>
      </Button>

      {roundState === ERoundState.RESULTS && (
        <Button size="auto" variant="primary">
          <a href={`/rounds/${round.pollId}`}>View Results</a>
        </Button>
      )}

      {!isConnected && !isMobile && <p className="text-gray-400">Connect your wallet to get started.</p>}

      {(roundState === ERoundState.APPLICATION || roundState === ERoundState.VOTING) && <ConnectButton showMobile />}

      {isConnected && !isRegistered && <JoinButton />}

      <Info showAppState pollId={round.pollId} showBallot={false} showRoundInfo={false} size="default" />
    </div>
  );
};
