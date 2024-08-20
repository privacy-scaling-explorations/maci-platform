import clsx from "clsx";
import Image from "next/image";
import React, { useCallback } from "react";
import { useFormContext } from "react-hook-form";

import { Label } from "~/components/ui/Form";
import { Input } from "~/components/ui/Input";
import { Tooltip } from "~/components/ui/Tooltip";

interface IRadioSelectProps {
  label: string;
  name: string;
  hint?: string;
  required?: boolean;
  options: string[];
}

export const RadioSelect = ({ label, name, required = false, hint = "", options }: IRadioSelectProps): JSX.Element => {
  const form = useFormContext();

  const handleOnClick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      form.setValue(name, e.target.id);
    },
    [form],
  );

  return (
    <div>
      <div className="flex items-center gap-1">
        {label && (
          <Label className="mb-1 dark:text-white" htmlFor={name} required={required}>
            {label}
          </Label>
        )}

        {hint && <Tooltip description={hint} />}
      </div>

      <div className="flex w-full flex-wrap gap-4">
        {options.map((option) => (
          <Label
            key={option}
            className={clsx(
              "flex cursor-pointer gap-2 rounded-md border border-gray-200 p-2 hover:border-blue-400",
              form.getValues(name) === option ? "border-2 border-blue-400" : "",
            )}
          >
            <Input id={option} name={name} type="radio" onClick={handleOnClick} />

            <Image alt={option} className="dark:invert" height="16" src={`/${option}.svg`} width="16" />

            {option}
          </Label>
        ))}
      </div>
    </div>
  );
};
