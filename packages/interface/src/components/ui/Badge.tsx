import { tv } from "tailwind-variants";

import { createComponent } from ".";

export const Badge = createComponent(
  "div",
  tv({
    base: "inline-flex items-center rounded font-semibold text-sm",
    variants: {
      variant: {
        default: "bg-gray-100",
        success: "bg-[#BBF7D0] text-[#14532D] dark:bg-[#031E0C] dark:text-[#4ADE80]",
        pending: "bg-[#FFEDD5] text-[#4E1D0D] dark:bg-[#4E1D0D] dark:text-[#F1B37A]",
        reject: "bg-[#FEE2E2] text-[#5E1414] dark:bg-[#3D0B0B] dark:text-[#F87171]",
        notice: "bg-[#6BB1EF] text-white dark:bg-[#0D172D] dark:text-[#2B62CA]",
      },
      size: {
        md: "px-3 py-1.5",
        lg: "px-2 py-1 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }),
);
