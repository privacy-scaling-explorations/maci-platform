import { tv } from "tailwind-variants";

import { createComponent } from ".";

const chip = tv({
  base: "rounded-md min-w-[42px] px-2 md:px-3 py-2 cursor-pointer inline-flex justify-center items-center whitespace-nowrap uppercase",
  variants: {
    color: {
      primary: "text-white bg-black border-none",
      secondary: "text-black bg-white border border-black",
      neutral: "text-blue-500 bg-blue-50 border border-blue-500",
      disabled: "cursor-not-allowed text-gray-500 bg-gray-50 border border-gray-500",
    },
  },
});

export const Chip = createComponent("button", chip);
