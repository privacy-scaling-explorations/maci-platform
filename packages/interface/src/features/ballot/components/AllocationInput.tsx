import { type ComponentPropsWithRef } from "react";
import { useFormContext, Controller } from "react-hook-form";

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
          <Input
            allowNegative={false}
            aria-label="allocation-input"
            error={props.error}
            {...field}
            autoComplete="off"
            defaultValue={props.defaultValue as string}
            disabled={props.disabled}
            max={votingMaxProject}
            min="0"
            type="number"
            onBlur={onBlur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              // Parse decimal string to number to adhere to AllocationSchema
              {
                let value = parseFloat(e.target.value.replace(/[,.]/g, ""));
                if (votingMaxProject !== undefined && value > votingMaxProject) {
                  value = votingMaxProject;
                  e.target.value = value.toString();
                }
                field.onChange(value);
              }
            }
          />
        )}
      />

      {tokenAddon && <InputAddon disabled={props.disabled}>{config.tokenName}</InputAddon>}
    </InputWrapper>
  );
};
