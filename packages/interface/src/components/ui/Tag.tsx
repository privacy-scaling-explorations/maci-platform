import { tv } from "tailwind-variants";

import { createComponent } from ".";

export const Tag = createComponent(
  "div",
  tv({
    base: "cursor-pointer font-inter inline-flex items-center border border-blue-500 justify-center gap-2 text-blue-500 whitespace-nowrap transition hover:bg-blue-50",
    variants: {
      size: {
        xs: "rounded py-1 px-[6px] text-[10px] leading-[16px] tracking-[0.05px]",
        sm: "rounded py-[2px] px-2 text-sm tracking-[0.05px]",
        md: "rounded-lg py-[2px] px-2 text-sm",
        lg: "rounded-xl py-2 px-4 text-lg",
      },
      selected: {
        true: "bg-blue-500 text-white hover:text-blue-500",
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
