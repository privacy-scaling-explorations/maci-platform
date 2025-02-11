import clsx from "clsx";
import { ExternalLinkIcon } from "lucide-react";
import NextLink from "next/link";
import { type ComponentProps } from "react";
import { tv } from "tailwind-variants";

import { createComponent } from ".";

export const Link = createComponent(
  NextLink,
  tv({
    base: "flex items-center font-normal text-base leading-6 gap-1 text-blue-500 underline duration-200 hover:opacity-50",
  }),
);

export const ExternalLink = ({ children, ...props }: ComponentProps<typeof NextLink>): JSX.Element => (
  <NextLink className={clsx("flex items-center gap-2")} {...props}>
    <span className="mr-1">{children}</span>

    <ExternalLinkIcon className="mt-1 h-4 w-4" />
  </NextLink>
);
