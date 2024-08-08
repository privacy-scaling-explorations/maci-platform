import { useFormContext } from "react-hook-form";

import { Button } from "~/components/ui/Button";

import type { TApplicationsToApprove } from "../types";
import type { Attestation } from "~/utils/types";

interface ISelectAllButtonProps {
  applications?: Attestation[];
}

export const SelectAllButton = ({ applications = [] }: ISelectAllButtonProps): JSX.Element => {
  const form = useFormContext<TApplicationsToApprove>();
  const selected = form.watch("selected");
  const isAllSelected = selected.length > 0 && selected.length === applications.length;
  return (
    <Button
      disabled={!applications.length}
      type="button"
      onClick={() => {
        const selectAll = isAllSelected ? [] : applications.map(({ id }) => id);
        form.setValue("selected", selectAll);
      }}
    >
      {isAllSelected ? "Deselect all" : "Select all"}
    </Button>
  );
};
