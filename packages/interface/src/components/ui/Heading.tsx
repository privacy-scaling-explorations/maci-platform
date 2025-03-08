import { tv } from "tailwind-variants";

import { createComponent } from ".";

export const Heading = createComponent(
  "div",
  tv({
    base: "font-mono font-normal dark:text-white uppercase tracking-[0.32px]",
    variants: {
      size: {
        md: "text-base leading-6",
        lg: "text-lg mt-2 mb-1 ",
        xl: "text-xl ",
        "2xl": "text-2xl mt-8 mb-4",
        "3xl": "text-[32px]",
        "4xl": "text-[40px] leading-[60px]",
        "6xl": "text-6xl mb-8",
      },
      margin: {
        none: "!mt-0 !mb-0",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }),
);
