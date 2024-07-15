import { type ComponentProps } from "react";

import { cn } from "~/utils/classNames";

export const Skeleton = ({
  isLoading = false,
  className,
  children,
}: ComponentProps<"span"> & { isLoading?: boolean }): JSX.Element =>
  isLoading ? (
    <span className={cn("inline-flex h-full min-w-[20px] animate-pulse rounded bg-gray-200", className)} />
  ) : (
    <div>{children}</div>
  );
