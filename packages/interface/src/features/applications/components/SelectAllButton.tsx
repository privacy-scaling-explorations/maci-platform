import { useFormContext } from "react-hook-form";

import { Button } from "~/components/ui/Button";

import type { TApplicationsToApprove } from "../types";
import type { IRequest } from "~/utils/types";

interface ISelectAllButtonProps {
  applications?: IRequest[];
}

export const SelectAllButton = ({ applications = [] }: ISelectAllButtonProps): JSX.Element => {
  const form = useFormContext<TApplicationsToApprove>();
  const selected = form.watch("selected");
  const isAllSelected = selected.length > 0 && selected.length === applications.length;
  return (
    <Button
      className="px-2 text-sm sm:px-4 sm:text-base"
      disabled={!applications.length}
      type="button"
      onClick={() => {
        const selectAll = isAllSelected ? [] : applications.map(({ index }) => index);
        form.setValue("selected", selectAll);
      }}
    >
      {isAllSelected ? "Deselect all" : "Select all"}
    </Button>
  );
};
