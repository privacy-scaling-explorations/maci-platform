import { useRef, useEffect } from "react";
import { useIntersection } from "react-use";

import { Spinner } from "./ui/Spinner";

interface IFetchInViewProps {
  hasMore?: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
}

export const FetchInView = ({ hasMore = false, isFetchingNextPage, fetchNextPage }: IFetchInViewProps): JSX.Element => {
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
