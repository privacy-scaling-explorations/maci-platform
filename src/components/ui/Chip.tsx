import { tv } from "tailwind-variants";
import { createComponent } from ".";

const chip = tv({
  base: "border border-PGFGreenD rounded-full min-w-[42px] px-2 md:px-3 py-2 cursor-pointer inline-flex justify-center items-center whitespace-nowrap text-PGFGreenL hover:text-PGFGreenD",
  variants: {},
});

export const Chip = createComponent("button", chip);
