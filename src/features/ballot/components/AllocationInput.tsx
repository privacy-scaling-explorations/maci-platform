import clsx from "clsx";
import React, { type ComponentPropsWithRef, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";

import { Input, InputAddon, InputWrapper } from "~/components/ui/Form";
import { config } from "~/config";
import { useMaci } from "~/contexts/Maci";

export interface IAllocationInputProps extends ComponentPropsWithRef<"input"> {
  votingMaxProject?: number;
  disabled?: boolean;
  tokenAddon?: boolean;
  error?: boolean;
}

export const AllocationInput = ({
  votingMaxProject = undefined,
  name,
  tokenAddon = false,
  onBlur,
  ...props
}: IAllocationInputProps): JSX.Element => {
  const form = useFormContext();
  const { initialVoiceCredits } = useMaci();
  const [exceededMaxTokens, setExceededMaxTokens] = useState<boolean>(false);

  const checkTotal = (amount: number) => {
    const total = config.pollMode === "qv" ? amount ** 2 : amount;
    const ret = total <= initialVoiceCredits;
    setExceededMaxTokens(!ret);

    return ret;
  };

  return (
    <InputWrapper className={clsx("min-w-[160px]", exceededMaxTokens && "border-red")}>
      <Controller
        control={form.control}
        name={name!}
        {...props}
        render={({ field }) => (
          <NumericFormat
            aria-label="allocation-input"
            customInput={Input}
            error={props.error}
            {...field}
            autoComplete="off"
            className="pr-16"
            defaultValue={props.defaultValue as string}
            disabled={props.disabled}
            isAllowed={({ floatValue }) =>
              votingMaxProject !== undefined ? (floatValue ?? 0) <= votingMaxProject : true
            }
            thousandSeparator=","
            onBlur={onBlur}
            onChange={(v) =>
              // Parse decimal string to number to adhere to AllocationSchema
              {
                const amount = parseFloat(v.target.value.replace(/,/g, ""));
                if (checkTotal(amount)) {
                  field.onChange(amount);
                }
              }
            }
          />
        )}
      />

      {tokenAddon && <InputAddon disabled={props.disabled}>{config.tokenName}</InputAddon>}
    </InputWrapper>
  );
};
