import { type UseTRPCInfiniteQueryResult } from "@trpc/react-query/shared";
import { useMemo, type ReactNode, useRef, useEffect } from "react";
import { useIntersection } from "react-use";

import { config } from "~/config";

import { EmptyState } from "./EmptyState";
import { Spinner } from "./ui/Spinner";

const columnMap = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
} as const;

type Props<T> = UseTRPCInfiniteQueryResult<T[], unknown, unknown> & {
  renderItem: (item: T, opts: { isLoading: boolean }) => ReactNode;
  columns?: keyof typeof columnMap;
};

const FetchInView = ({
  hasMore = false,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasMore?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
}) => {
  const ref = useRef(null);
  const intersection = useIntersection(ref, {
    root: null,
    rootMargin: "0px",
    threshold: 0.5,
  });

  useEffect(() => {
    if (intersection?.isIntersecting && !isFetchingNextPage && hasMore) {
      // eslint-disable-next-line no-console
      fetchNextPage().catch(console.error);
    }
  }, [intersection?.isIntersecting, isFetchingNextPage, hasMore, fetchNextPage]);

  return (
    <div ref={ref} className="flex h-96 items-center justify-center">
      {isFetchingNextPage && <Spinner />}
    </div>
  );
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
