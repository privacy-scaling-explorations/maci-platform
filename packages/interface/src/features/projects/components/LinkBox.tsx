import { ExternalLink } from "~/components/ui/Link";

import type { ReactNode } from "react";

export interface ILinkBoxProps<T> {
  label: string;
  links?: T[];
  renderItem: (link: T) => ReactNode;
}

export const LinkBox = <T extends { url: string }>({
  label,
  links = [],
  renderItem,
}: ILinkBoxProps<T>): JSX.Element => (
  <div className="rounded-xl border p-3">
    <div className="mb-2 font-bold tracking-wider text-gray-600">{label}</div>

    <div className="space-y-2">
      {links.map((link) => (
        <ExternalLink key={link.url} className="flex gap-2 hover:underline" href={link.url}>
          {renderItem(link)}
        </ExternalLink>
      ))}
    </div>
  </div>
);
