import { tv } from "tailwind-variants";

import { createComponent } from "~/components/ui";

import { BackgroundImage } from "./BackgroundImage";

export const Banner = createComponent(
  BackgroundImage,
  tv({
    base: "bg-gray-200",
    variants: {
      size: {
        md: "h-24 rounded-t-xl",
        lg: "h-80 rounded-t-xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }),
);
