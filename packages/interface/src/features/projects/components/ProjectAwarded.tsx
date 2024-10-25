import { Hex } from "viem";

import { Button } from "~/components/ui/Button";
import { config } from "~/config";
import { useProjectResults } from "~/hooks/useResults";
import { formatNumber } from "~/utils/formatNumber";

export interface IProjectAwardedProps {
  pollId: string;
  tallyFile?: string;
  registryAddress: string;
  id?: string;
}

export const ProjectAwarded = ({
  pollId,
  tallyFile = undefined,
  registryAddress,
  id = "",
}: IProjectAwardedProps): JSX.Element | null => {
  const amount = useProjectResults(id, registryAddress as Hex, pollId, tallyFile);

  if (amount.isLoading) {
    return null;
  }

  return <Button variant="primary">{`${formatNumber(amount.data?.amount ?? 0)} ${config.tokenName}`}</Button>;
};
