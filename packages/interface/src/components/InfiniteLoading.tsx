import { type UseTRPCInfiniteQueryResult } from "@trpc/react-query/shared";
import { useMemo, type ReactNode } from "react";

import { config } from "~/config";

import { EmptyState } from "./EmptyState";
import { FetchInView } from "./FetchInView";

const columnMap = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
} as const;

type Props<T> = UseTRPCInfiniteQueryResult<T[], unknown, unknown> & {
  renderItem: (item: T, opts: { isLoading: boolean }) => ReactNode;
  columns?: keyof typeof columnMap;
};

export const InfiniteLoading = <T,>({
  data,
  columns = 3,
  isFetchingNextPage,
  isLoading,
  renderItem,
  fetchNextPage,
}: Props<T>): JSX.Element => {
  const loadingItems = useMemo(
    () =>
      Array.from({ length: config.pageSize }).map((_, id) => ({
        id,
      })) as T[],
    [],
  );
  const pages = useMemo(() => data?.pages ?? [], [data?.pages]);
  const items = useMemo(() => pages.reduce<T[]>((acc, x) => acc.concat(x), []), [pages]);

  const hasMore = useMemo(() => {
    if (!pages.length) {
      return false;
    }
    return (pages[pages.length - 1]?.length ?? 0) === config.pageSize;
  }, [pages]);

  return (
    <div>
      {!isLoading && !items.length ? <EmptyState title="No results found" /> : null}

      <div className={`mb-16 grid ${columnMap[columns]} gap-4`}>
        {items.map((item) => renderItem(item, { isLoading }))}

        {(isLoading || isFetchingNextPage) && loadingItems.map((item) => renderItem(item, { isLoading }))}
      </div>

      <FetchInView fetchNextPage={fetchNextPage} hasMore={hasMore} isFetchingNextPage={isFetchingNextPage} />
    </div>
  );
};
