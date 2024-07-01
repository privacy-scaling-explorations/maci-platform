import { tv } from "tailwind-variants";

import { createComponent } from ".";

export const Badge = createComponent(
  "div",
  tv({
    base: "inline-flex items-center rounded font-semibold text-sm p-2",
    variants: {
      variant: {
        default: "bg-gray-100 dark:bg-gray-800",
        success: "bg-[#BBF7D0] text-[#14532D]",
        pending: "bg-[#FFEDD5] text-[#4E1D0D]",
      },
      size: {
        md: "px-1 ",
        lg: "px-2 py-1 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }),
);
