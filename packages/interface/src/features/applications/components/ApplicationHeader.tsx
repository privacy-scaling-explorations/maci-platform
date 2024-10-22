import type { IRequest } from "~/utils/types";

import { SelectAllButton } from "./SelectAllButton";

interface IApplicationHeaderProps {
  applications?: IRequest[];
}

export const ApplicationHeader = ({ applications = [] }: IApplicationHeaderProps): JSX.Element => (
  <div className="dark:bg-lighterBlack flex items-center bg-gray-50 py-4">
    <div className="flex-1 justify-center">
      <SelectAllButton applications={applications} />
    </div>

    <div className="flex-[2] sm:flex-[8] sm:pl-6">Project</div>

    <div className="flex-[3]">Submitted on</div>

    <div className="flex-[2]">Status</div>
  </div>
);
