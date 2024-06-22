import { type PropsWithChildren } from "react";

import { Heading } from "./ui/Heading";

export const EmptyState = ({ title, children = null }: PropsWithChildren<{ title: string }>): JSX.Element => (
  <div className="flex flex-col items-center justify-center rounded border p-8 dark:border-gray-700">
    <Heading as="h3" className="mt-0" size="lg">
      {title}
    </Heading>

    <div>{children}</div>
  </div>
);
