import { useController, useFormContext } from "react-hook-form";
import { z } from "zod";

import { ErrorMessage, Label } from "~/components/ui/Form";
import { Tag } from "~/components/ui/Tag";
import { impactCategories } from "~/config";

import { ApplicationSchema } from "../types";

export const ImpactTags = (): JSX.Element => {
  const { control, watch, formState } = useFormContext<z.infer<typeof ApplicationSchema>>();
  const { field } = useController({
    name: "impactCategory",
    control,
  });

  const selected = watch("impactCategory") ?? [];

  const error = formState.errors.impactCategory;

  return (
    <div className="mb-4">
      <Label>
        Impact categories<span className="text-blue-400">*</span>
      </Label>

      <p className="mb-2 text-gray-300">Please select the categories your project is related to </p>

      <div className="flex flex-wrap gap-2">
        {Object.entries(impactCategories).map(([value, { label }]) => {
          const isSelected = selected.includes(value);
          return (
            <Tag
              key={value}
              selected={isSelected}
              size="md"
              onClick={() => {
                const currentlySelected = isSelected ? selected.filter((s) => s !== value) : selected.concat(value);

                field.onChange(currentlySelected);
              }}
            >
              {label}
            </Tag>
          );
        })}
      </div>

      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </div>
  );
};
