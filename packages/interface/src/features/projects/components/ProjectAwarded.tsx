import { Button } from "~/components/ui/Button";
import { config } from "~/config";
import { useProjectResults } from "~/hooks/useResults";
import { formatNumber } from "~/utils/formatNumber";

export interface IProjectAwardedProps {
  roundId: string;
  tallyFile?: string;
  id?: string;
}

export const ProjectAwarded = ({
  roundId,
  tallyFile = undefined,
  id = "",
}: IProjectAwardedProps): JSX.Element | null => {
  const amount = useProjectResults(id, roundId, tallyFile);

  if (amount.isLoading) {
    return null;
  }

  return <Button variant="primary">{`${formatNumber(amount.data?.amount ?? 0)} ${config.tokenName}`}</Button>;
};
