import { UseQueryStatesReturn, parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

import { OrderBy, SortOrder } from "../types";

export const sortLabels = {
  name_asc: "A to Z",
  name_desc: "Z to A",
  time_asc: "Oldest",
  time_desc: "Newest",
};

export type SortType = keyof typeof sortLabels;

const queryParams = {
  search: parseAsString.withDefault(""),
  orderBy: parseAsStringEnum<OrderBy>(Object.values(OrderBy)).withDefault(OrderBy.name),
  sortOrder: parseAsStringEnum<SortOrder>(Object.values(SortOrder)).withDefault(SortOrder.asc),
};

export type TUseFilterReturn = UseQueryStatesReturn<typeof queryParams>[0] & {
  setFilter: UseQueryStatesReturn<typeof queryParams>[1];
};

export function useFilter(): TUseFilterReturn {
  const [filter, setFilter] = useQueryStates(queryParams, { history: "replace" });

  return { ...filter, setFilter };
}
