import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Search, Trash } from "lucide-react";
import {
  type ComponentPropsWithRef,
  type PropsWithChildren,
  type ReactElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type ComponentProps,
  forwardRef,
  cloneElement,
} from "react";
import {
  FormProvider,
  useForm,
  useFormContext,
  type UseFormReturn,
  type UseFormProps,
  useFieldArray,
} from "react-hook-form";
import { tv } from "tailwind-variants";
import { type z } from "zod";

import { cn } from "~/utils/classNames";

import { IconButton } from "./Button";
import { inputBase, Input, InputWrapper, InputIcon } from "./Input";

import { createComponent } from ".";

export const Select = createComponent(
  "select",
  tv({
    base: [...inputBase],
    variants: {
      error: {
        true: "!border-red-900",
      },
    },
  }),
);

export const Checkbox = createComponent(
  "input",
  tv({
    base: [...inputBase, "checked:focus:dark:bg-gray-700 checked:hover:dark:bg-gray-700"],
  }),
);

export const Label = createComponent(
  "label",
  tv({
    base: "block tracking-wider dark:text-gray-300 font-semibold",
    variants: { required: { true: "after:content-['*']" } },
  }),
);

export const ErrorMessage = createComponent("div", tv({ base: "pt-1 text-xs text-red-500" }));

export const Textarea = createComponent("textarea", tv({ base: [...inputBase, "w-full"] }));

export const SearchInput = forwardRef(({ ...props }: ComponentPropsWithRef<typeof Input>, ref) => (
  <InputWrapper className="">
    <InputIcon>
      <Search />
    </InputIcon>

    <Input ref={ref} {...props} className="rounded-full pl-10" />
  </InputWrapper>
));

SearchInput.displayName = "SearchInput";

export interface IFormControlProps extends ComponentPropsWithoutRef<"fieldset"> {
  name: string;
  label?: string;
  required?: boolean;
  valueAsNumber?: boolean;
  hint?: string;
}

export const FormControl = ({
  name,
  label = "",
  hint = "",
  required = false,
  children = null,
  valueAsNumber = false,
  className = "",
}: IFormControlProps): JSX.Element => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // Get error for name - handles field arrays (field.index.prop)
  const [index] = name.split(".");
  const error = index && errors[index];

  return (
    <fieldset className={cn("mb-4", className)}>
      {label && (
        <Label className="mb-1" htmlFor={name} required={required}>
          {label}
        </Label>
      )}

      {cloneElement(children as ReactElement, {
        id: name,
        error: Boolean(error),
        ...register(name, { valueAsNumber }),
      })}

      {hint && <div className="pt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</div>}

      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </fieldset>
  );
};

export const FieldArray = <S extends z.Schema>({
  name,
  renderField,
}: {
  name: string;
  renderField: (field: z.infer<S>, index: number) => ReactNode;
}): JSX.Element => {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
  });

  const error = form.formState.errors[name]?.message ?? "";

  return (
    <div className="mb-8">
      {error && (
        <div className="border-red-900 dark:text-red-500 border p-2">
          {String(error)}
        </div>
      )}
      {fields.map((field, i) => (
        <div key={field.id} className="gap-4 md:flex">
          {renderField(field, i)}

          <div className="flex justify-end">
            <IconButton
              icon={Trash}
              tabIndex={-1}
              type="button"
              variant="ghost"
              onClick={() => {
                remove(i);
              }}
            />
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <IconButton
          icon={PlusIcon}
          size="sm"
          type="button"
          onClick={() => {
            append({});
          }}
        >
          Add row
        </IconButton>
      </div>
    </div>
  );
};

export const FormSection = ({
  title,
  description,
  children,
}: { title: string; description: string } & ComponentProps<"section">): JSX.Element => (
  <section className="mb-8">
    <h3 className="mb-1 text-xl font-semibold">{title}</h3>

    <p className="mb-4 leading-loose text-gray-600 dark:text-gray-400">{description}</p>

    {children}
  </section>
);

export interface FormProps<S extends z.Schema> extends PropsWithChildren {
  defaultValues?: UseFormProps<z.infer<S>>["defaultValues"];
  values?: UseFormProps<z.infer<S>>["values"];
  schema: S;
  onSubmit: (values: z.infer<S>, form: UseFormReturn<z.infer<S>>) => void;
}

export const Form = <S extends z.Schema>({
  schema,
  children,
  values = undefined,
  defaultValues = undefined,
  onSubmit,
}: FormProps<S>): JSX.Element => {
  // Initialize the form with defaultValues and schema for validation
  const form = useForm({
    defaultValues,
    values,
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  // Pass the form methods to a FormProvider. This lets us access the form from components with useFormContext
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          onSubmit(data, form);
        })}
      >
        {children}
      </form>
    </FormProvider>
  );
};
