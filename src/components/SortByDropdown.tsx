import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowUpDown, Check } from "lucide-react";

import { type SortType, sortLabels } from "~/features/filter/hooks/useFilter";

import { IconButton } from "./ui/Button";

interface ISortByDropdownProps {
  value: SortType;
  onChange: (value: string) => void;
  options: SortType[];
}

interface IRadioItemProps {
  label?: string;
  value?: string;
}

const RadioItem = ({ value = "", label = "" }: IRadioItemProps): JSX.Element => (
  <DropdownMenu.RadioItem
    className="cursor-pointer rounded p-2 pl-8 text-sm text-gray-900 outline-none hover:bg-gray-100 focus-visible:ring-0 dark:text-gray-300 dark:hover:bg-gray-800"
    value={value}
  >
    <DropdownMenu.ItemIndicator className="absolute left-4">
      <Check className="h-4 w-4" />
    </DropdownMenu.ItemIndicator>

    {label}
  </DropdownMenu.RadioItem>
);

export const SortByDropdown = ({ value, onChange, options = [] }: ISortByDropdownProps): JSX.Element => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <IconButton aria-label="Sort by" className="w-48 justify-start" icon={ArrowUpDown} variant="outline">
        Sort by: {sortLabels[value]}
      </IconButton>
    </DropdownMenu.Trigger>

    <DropdownMenu.Portal>
      <DropdownMenu.Content
        className="z-50 w-[200px] rounded-xl border border-gray-300 bg-white p-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        sideOffset={5}
      >
        <DropdownMenu.Label className="dark:gray-500 p-2 text-xs font-semibold uppercase text-gray-700">
          Sort By
        </DropdownMenu.Label>

        <DropdownMenu.RadioGroup
          value={value}
          onValueChange={(v) => {
            onChange(v);
          }}
        >
          {options.map((option) => (
            <RadioItem key={option} label={sortLabels[option]} value={option} />
          ))}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);
