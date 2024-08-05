import { tv } from "tailwind-variants";

import { createComponent } from ".";

export const Heading = createComponent(
  "div",
  tv({
    base: "font-bold dark:text-white font-mono uppercase",
    variants: {
      size: {
        md: "text-base",
        lg: "text-lg mt-2 mb-1 ",
        xl: "text-xl ",
        "2xl": "text-2xl mt-8 mb-4 ",
        "3xl": "text-[32px]",
        "4xl": "text-[40px]",
        "6xl": "text-6xl mb-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }),
);
