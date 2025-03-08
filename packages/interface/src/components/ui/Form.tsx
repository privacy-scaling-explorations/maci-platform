import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlusIcon, Search } from "lucide-react";
import {
  type ComponentPropsWithRef,
  type PropsWithChildren,
  type ReactElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type ComponentProps,
  forwardRef,
  cloneElement,
  useState,
  useCallback,
  useEffect,
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

import { Heading } from "./Heading";
import { inputBase, Input, InputWrapper, InputIcon } from "./Input";

import { createComponent } from ".";

const TIMEOUT_DURATION = 7000;

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
    base: [...inputBase, "rounded-none checked:focus:dark:bg-gray-700 checked:hover:dark:bg-gray-700"],
  }),
);

export const Label = createComponent(
  "label",
  tv({
    base: "block tracking-wider font-medium text-black font-sans text-sm leading-5 dark:text-white",
    variants: {
      required: {
        true: "after:content-['*'] after:text-blue-400",
        false:
          "after:content-['(optional)'] after:text-gray-300 after:leading-[18px] after:text-xs after:font-normal after:ml-1",
      },
    },
  }),
);

export const ErrorMessage = createComponent("div", tv({ base: "pt-1 text-xs text-red" }));

export const Textarea = createComponent("textarea", tv({ base: [...inputBase, "w-full"] }));

export const SearchInput = forwardRef(({ ...props }: ComponentPropsWithRef<typeof Input>, ref) => (
  <InputWrapper>
    <InputIcon>
      <Search />
    </InputIcon>

    <Input ref={ref} {...props} className="rounded-lg pl-10" />
  </InputWrapper>
));

SearchInput.displayName = "SearchInput";

export interface IFormControlProps extends ComponentPropsWithoutRef<"fieldset"> {
  name: string;
  label?: string;
  description?: string;
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
  description = "",
}: IFormControlProps): JSX.Element => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // Get error for name - handles field arrays (field.index.prop)
  const [index] = name.split(".");
  const error = index && errors[index];

  return (
    <fieldset className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-1">
        {label && (
          <Label className="dark:text-white" htmlFor={name} required={required}>
            {label}
          </Label>
        )}

        {hint && <span className="text-xs font-normal leading-[18px] text-gray-300">{`(${hint})`}</span>}
      </div>

      {cloneElement(children as ReactElement, {
        id: name,
        error: String(error),
        ...register(name, { valueAsNumber }),
      })}

      {description && <span className="text-sm font-normal leading-5 text-gray-300">{description}</span>}

      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </fieldset>
  );
};

export const FieldArray = <S extends z.Schema>({
  title,
  description,
  name,
  renderField,
}: {
  title: string;
  description: string;
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
    <div className="flex flex-col gap-[10px] dark:text-white">
      <div className="flex flex-col gap-[3px]">
        <Heading className="font-sans text-2xl font-bold">{title}</Heading>

        <span className="font-sans text-sm font-normal leading-5 text-gray-400">{description}</span>
      </div>

      {error && <div className="border border-red-900 p-2">{String(error)}</div>}

      {fields.map((field, i) => (
        <div key={field.id} className="relative flex flex-col">
          <div className="gap-4 md:flex">{renderField(field, i)}</div>

          <button
            className="absolute bottom-0 right-0 font-sans text-sm text-gray-400 underline duration-200 hover:text-blue-500"
            type="button"
            onClick={() => {
              remove(i);
            }}
          >
            Delete
          </button>
        </div>
      ))}

      <button
        className="flex w-full items-center gap-[6px] border-t border-gray-100 p-[6px] pt-4 font-sans text-xs font-semibold uppercase text-black duration-200 hover:text-blue-500 dark:text-white"
        type="button"
        onClick={() => {
          append({});
        }}
      >
        <CirclePlusIcon className="size-4" />
        Add row
      </button>
    </div>
  );
};

export const FormSection = ({
  title,
  description,
  children = null,
  className = "",
  ...props
}: { title: string; description: string } & ComponentProps<"section">): JSX.Element => (
  <section className={cn("flex max-w-[824px] flex-col gap-10", className)} {...props}>
    <div className="flex flex-col gap-[10px]">
      <Heading className="font-sans text-2xl font-bold">{title}</Heading>

      <p className="font-sans text-base font-normal leading-6 text-gray-400">{description}</p>
    </div>

    <div className="flex flex-col gap-6">{children}</div>
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const onSubmitForm = useCallback(
    form.handleSubmit(
      (data) => {
        setErrorMessage(null);
        onSubmit(data, form);
      },
      () => {
        setErrorMessage("There are errors in the form. Please go back and check the warnings.");
      },
    ),
    [setErrorMessage, onSubmit, form],
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (errorMessage) {
      timeout = setTimeout(() => {
        setErrorMessage(null);
      }, TIMEOUT_DURATION);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [errorMessage]);

  // Pass the form methods to a FormProvider. This lets us access the form from components with useFormContext
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmitForm}>
        {children}

        {errorMessage && <ErrorMessage style={{ textAlign: "end" }}>{errorMessage}</ErrorMessage>}
      </form>
    </FormProvider>
  );
};
