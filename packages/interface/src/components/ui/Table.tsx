import { tv } from "tailwind-variants";

import { createComponent } from ".";

export const Table = createComponent(
  "table",
  tv({
    base: "w-full border-separate border-spacing-y-4 border-spacing-x-0",
  }),
);
export const Thead = createComponent("thead", tv({ base: "" }));
export const Tbody = createComponent("tbody", tv({ base: "" }));
export const Tr = createComponent("tr", tv({ base: "" }));
export const Td = createComponent(
  "td",
  tv({
    base: "p-4 border-y border-gray-200",
    variants: {
      variant: {
        first: "border-l rounded-l-lg",
        last: "border-r rounded-r-lg",
      },
    },
  }),
);
