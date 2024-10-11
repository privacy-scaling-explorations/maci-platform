import { ZeroAddress } from "ethers";
import { useMemo } from "react";
import { Hex } from "viem";

import { Button } from "~/components/ui/Button";
import { config } from "~/config";
import { useRound } from "~/contexts/Round";
import { useProjectResults } from "~/hooks/useResults";
import { formatNumber } from "~/utils/formatNumber";

export interface IProjectAwardedProps {
  pollId: string;
  registryAddress: string;
  id?: string;
}

export const ProjectAwarded = ({ pollId, registryAddress, id = "" }: IProjectAwardedProps): JSX.Element | null => {
  const { getRoundByPollId } = useRound();
  const round = useMemo(() => getRoundByPollId(pollId), [pollId, getRoundByPollId]);
  const amount = useProjectResults(id, registryAddress as Hex, pollId, (round?.tallyAddress ?? ZeroAddress) as Hex);

  if (amount.isLoading) {
    return null;
  }

  return <Button variant="primary">{`${formatNumber(amount.data?.amount ?? 0)} ${config.tokenName}`}</Button>;
};
