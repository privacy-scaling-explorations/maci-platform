import clsx from "clsx";
import { ExternalLinkIcon } from "lucide-react";
import NextLink from "next/link";
import { type ComponentProps } from "react";
import { tv } from "tailwind-variants";

import { createComponent } from ".";

export const Link = createComponent(
  NextLink,
  tv({
    base: "flex items-center gap-1 text-blue-400 hover:underline",
  }),
);

export const ExternalLink = ({ children, ...props }: ComponentProps<typeof NextLink>): JSX.Element => (
  <NextLink className={clsx("flex items-center gap-2 font-semibold hover:underline")} {...props}>
    <span className="mr-1">{children}</span>

    <ExternalLinkIcon className="mt-1 h-4 w-4" />
  </NextLink>
);
