import { ReactNode } from "react";
import { tv } from "tailwind-variants";

import { createComponent } from "~/components/ui";

const StatusBarContainer = createComponent(
  "div",
  tv({
    base: "flex rounded-md border p-4 justify-center mb-4",
    variants: {
      status: {
        default: "text-blue-600 border-blue-600 bg-blue-400",
        pending:
          "text-[#4E1D0D] border-[#4E1D0D] bg-[#FFEDD5] dark:text-[#F1B37A] dark:bg-[#4E1D0D] dark:border-[#F1B37A]",
        approved:
          "text-[#14532D] border-[#14532D] bg-[#BBF7D0] dark:text-[#4ADE80] dark:border-[#4ADE80] dark:bg-[#031E0C]",
        declined:
          "text-[#F87171] border-[#F87171] bg-[#FEE2E2] dark:text-[#F87171] dark:border-[#F87171] dark:bg-[#3D0B0B]",
      },
    },
    defaultVariants: {
      status: "default",
    },
  }),
);

interface IStatusBarProps {
  status: string;
  content: ReactNode;
}

export const StatusBar = ({ status, content }: IStatusBarProps): JSX.Element => (
  <StatusBarContainer status={status}>{content}</StatusBarContainer>
);
