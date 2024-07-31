import { tv } from "tailwind-variants";

import { BackgroundImage } from "./BackgroundImage";

import { createComponent } from ".";

export const Avatar = createComponent(
  BackgroundImage,
  tv({
    base: "bg-gray-200 border-2 border-white",
    variants: {
      size: {
        xs: "w-5 h-5 rounded-xs",
        sm: "w-12 h-12 rounded-md",
        md: "w-16 h-16 rounded-md",
        lg: "w-40 h-40 rounded-3xl",
      },
      rounded: {
        full: "rounded-full",
      },
      bordered: {
        true: "outline outline-white",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }),
);
