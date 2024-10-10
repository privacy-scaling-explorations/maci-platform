import { Button } from "~/components/ui/Button";
import { config } from "~/config";
import { useMaci } from "~/contexts/Maci";
import { useProjectResults } from "~/hooks/useResults";
import { formatNumber } from "~/utils/formatNumber";

export interface IProjectAwardedProps {
  roundId: string;
  id?: string;
}

export const ProjectAwarded = ({ roundId, id = "" }: IProjectAwardedProps): JSX.Element | null => {
  const { pollData } = useMaci();
  const amount = useProjectResults(id, roundId, pollData);

  if (amount.isLoading) {
    return null;
  }

  return <Button variant="primary">{`${formatNumber(amount.data?.amount ?? 0)} ${config.tokenName}`}</Button>;
};
