import { tv } from "tailwind-variants";

import { createComponent } from ".";

export const Tag = createComponent(
  "div",
  tv({
    base: "cursor-pointer inline-flex items-center border border-blue-400 justify-center gap-2 text-blue-400 whitespace-nowrap transition hover:bg-blue-50",
    variants: {
      size: {
        sm: "rounded py-1 px-2 text-xs",
        md: "rounded-lg py-1.5 px-3 text-sm",
        lg: "rounded-xl py-2 px-4 text-lg",
      },
      selected: {
        true: "bg-blue-400 text-white",
      },
      disabled: {
        true: "border-gray-200 text-gray-200 cursor-not-allowed",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }),
);
