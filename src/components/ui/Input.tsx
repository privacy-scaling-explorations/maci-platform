import { tv } from "tailwind-variants";

import { createComponent } from ".";

export const inputBase = [
  "dark:bg-gray-900",
  "dark:text-gray-300",
  "dark:border-gray-700",
  "disabled:opacity-30",
  "checked:bg-gray-800",
  "outline-none",
  "border-gray-200",
  "rounded-lg",
  "border",
  "placeholder:text-gray-300",
];

export const Input = createComponent(
  "input",
  tv({
    base: ["w-full", ...inputBase],
    variants: {
      error: {
        true: "!border-red-900",
      },
    },
  }),
);

export const InputWrapper = createComponent(
  "div",
  tv({
    base: "flex w-full relative",
    variants: {},
  }),
);

export const InputAddon = createComponent(
  "div",
  tv({
    base: "absolute right-0 text-gray-900 dark:text-gray-300 inline-flex items-center justify-center h-full border-gray-300 dark:border-gray-800 border-l px-4 font-semibold",
    variants: {
      disabled: {
        true: "text-gray-500 dark:text-gray-500",
      },
    },
  }),
);

export const InputIcon = createComponent(
  "div",
  tv({
    base: "absolute text-gray-600 left-0 inline-flex items-center justify-center h-full px-4",
  }),
);
