import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowUpDown, Check } from "lucide-react";
import { useCallback } from "react";

import { type SortType, sortLabels } from "~/features/filter/hooks/useFilter";

import { IconButton } from "./ui/Button";

interface ISortByDropdownProps {
  value: SortType;
  onChange: (value: string) => void;
  options?: SortType[];
}

interface IRadioItemProps {
  label?: string;
  value?: string;
}

const RadioItem = ({ value = "", label = "" }: IRadioItemProps): JSX.Element => (
  <DropdownMenu.RadioItem
    className="dark:bg-lightBlack cursor-pointer rounded p-2 pl-8 text-sm text-gray-900 outline-none hover:bg-gray-100 focus-visible:ring-0 dark:text-white"
    value={value}
  >
    <DropdownMenu.ItemIndicator className="absolute left-4">
      <Check className="h-4 w-4" />
    </DropdownMenu.ItemIndicator>

    {label}
  </DropdownMenu.RadioItem>
);

export const SortByDropdown = ({ value, onChange, options = [] }: ISortByDropdownProps): JSX.Element => {
  const handleOnChange = useCallback(
    (v: string) => {
      onChange(v);
    },
    [onChange],
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild className="rounded-md border-gray-200 text-gray-600 dark:border-gray-800">
        <IconButton aria-label="Sort by" className="my-0 w-48" icon={ArrowUpDown} variant="outline">
          Sort by: {sortLabels[value]}
        </IconButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="dark:bg-lightBlack z-50 w-[200px] rounded-md border border-gray-300 bg-white p-2"
          sideOffset={5}
        >
          <DropdownMenu.Label className="p-2 text-xs font-semibold uppercase text-gray-700 dark:text-white">
            Sort By
          </DropdownMenu.Label>

          <DropdownMenu.RadioGroup value={value} onValueChange={handleOnChange}>
            {options.map((option) => (
              <RadioItem key={option} label={sortLabels[option]} value={option} />
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
