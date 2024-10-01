import { type PropsWithChildren } from "react";

import { Heading } from "./ui/Heading";

export const EmptyState = ({ title, children = null }: PropsWithChildren<{ title: string }>): JSX.Element => (
  <div className="m-2 flex flex-col items-center justify-center rounded border p-8">
    <Heading as="h3" className="mt-0" size="lg">
      {title}
    </Heading>

    <div>{children}</div>
  </div>
);
