import React, { useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { NumericFormat } from "react-number-format";

import { Label } from "~/components/ui/Form";
import { Input } from "~/components/ui/Input";
import { RadioSelect } from "~/components/ui/RadioSelect";
import { creditStrategyTypes, type Deployment } from "~/features/rounds/types";

export const VoiceCreditProxySelect = (): JSX.Element => {
  const form = useFormContext<Deployment>();

  const [creditStrategy] = useMemo(() => form.watch(["creditStrategy"]), [form]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      form.setValue("creditAmount", Number(e.target.value));
    },
    [form],
  );

  return (
    <div className="flex flex-col gap-4">
      <RadioSelect
        required
        hint="Choose a strategy to distribute voice credit"
        label="Credit Allocation"
        name="creditStrategy"
        options={Object.values(creditStrategyTypes)}
      />

      <div className={creditStrategy === creditStrategyTypes.CONSTANT ? "block" : "hidden"}>
        <div className="flex items-center gap-1">
          <Label className="mb-1 dark:text-white" htmlFor="creditAmount">
            Constant Voice Credits
          </Label>
        </div>

        <NumericFormat
          allowNegative={false}
          aria-label="allocation-input"
          autoComplete="off"
          className="dark:bg-lightBlack w-96 dark:text-white"
          customInput={Input}
          decimalScale={0}
          defaultValue={0}
          onChange={handleInput}
        />
      </div>
    </div>
  );
};
