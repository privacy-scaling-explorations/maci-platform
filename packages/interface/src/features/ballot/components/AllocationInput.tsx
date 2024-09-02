import { type ComponentPropsWithRef } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { NumericFormat } from "react-number-format";

import { Input, InputAddon, InputWrapper } from "~/components/ui/Input";
import { config } from "~/config";

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

  return (
    <InputWrapper className="min-w-[132px]">
      <Controller
        control={form.control}
        name={name!}
        {...props}
        render={({ field }) => (
          <NumericFormat
            allowNegative={false}
            decimalScale={0}
            aria-label="allocation-input"
            customInput={Input}
            error={props.error}
            {...field}
            autoComplete="off"
            className="pr-16"
            defaultValue={props.defaultValue as string}
            disabled={props.disabled}
            isAllowed={({ floatValue }) =>
              votingMaxProject !== undefined ? (floatValue ?? 0) <= votingMaxProject : (floatValue ?? 0) >= 0
            }
            thousandSeparator=","
            onBlur={onBlur}
            onChange={(v) =>
              // Parse decimal string to number to adhere to AllocationSchema
              {
                field.onChange(parseFloat(v.target.value.replace(/,/g, "")));
              }
            }
          />
        )}
      />

      {tokenAddon && <InputAddon disabled={props.disabled}>{config.tokenName}</InputAddon>}
    </InputWrapper>
  );
};
