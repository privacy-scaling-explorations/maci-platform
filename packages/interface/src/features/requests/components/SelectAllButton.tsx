import { useFormContext } from "react-hook-form";

import { Button } from "~/components/ui/Button";

import type { TRequestToApprove } from "../../proposals/types";
import type { IRequest } from "~/utils/types";

interface ISelectAllButtonProps {
  requests?: IRequest[];
}

export const SelectAllButton = ({ requests = [] }: ISelectAllButtonProps): JSX.Element => {
  const form = useFormContext<TRequestToApprove>();
  const selected = form.watch("selected");
  const isAllSelected = selected.length > 0 && selected.length === requests.length;
  return (
    <Button
      className="px-2 text-sm sm:px-4 sm:text-base"
      disabled={!requests.length}
      type="button"
      onClick={() => {
        const selectAll = isAllSelected ? [] : requests.map(({ index }) => index);
        form.setValue("selected", selectAll);
      }}
    >
      {isAllSelected ? "Deselect all" : "Select all"}
    </Button>
  );
};
