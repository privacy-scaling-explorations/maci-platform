import { tv } from "tailwind-variants";

import { createComponent } from ".";

const ProgressWrapper = createComponent(
  "div",
  tv({
    base: "h-1 rounded-full bg-gray-200 relative overflow-hidden",
  }),
);

export interface IProgressProps {
  value?: number;
  max?: number;
}

export const Progress = ({ value = 0, max = 100 }: IProgressProps): JSX.Element => (
  <ProgressWrapper>
    <div
      className="bg-primary-600 absolute h-1 rounded-full transition-all"
      style={{ width: `${(value / max) * 100}%` }}
    />
  </ProgressWrapper>
);
