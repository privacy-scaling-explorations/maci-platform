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

import { IconButton } from "./Button";
import { Heading } from "./Heading";
import { inputBase, Input, InputWrapper, InputIcon } from "./Input";
import { Tooltip } from "./Tooltip";

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
    base: "block tracking-wider font-semibold dark:text-white",
    variants: {
      required: {
        true: "after:content-['*'] after:text-blue-400",
        false: "after:content-['(optional)'] after:text-gray-300 after:text-sm after:font-semibold after:ml-1",
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
    <fieldset className={cn(className)}>
      <div className="flex items-center gap-1">
        {label && (
          <Label className="mb-1 dark:text-white" htmlFor={name} required={required}>
            {label}
          </Label>
        )}

        {hint && <Tooltip description={hint} />}
      </div>

      {cloneElement(children as ReactElement, {
        id: name,
        error: String(error),
        ...register(name, { valueAsNumber }),
      })}

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
    <div className="mb-8">
      <p className="dark:text-white">{title}</p>

      <p className="mb-2 text-gray-300">{description}</p>

      {error && <div className="border border-red-900 p-2">{String(error)}</div>}

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

      <div className="flex justify-start">
        <IconButton
          icon={PlusIcon}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => {
            append({});
          }}
        >
          Add row
        </IconButton>
      </div>

      <div className="mt-4 h-[1px] w-full bg-gray-100" />
    </div>
  );
};

export const FormSection = ({
  title,
  description,
  children,
  ...props
}: { title: string; description: string } & ComponentProps<"section">): JSX.Element => (
  <section className="mb-8" {...props}>
    <Heading className="mb-1 font-sans text-xl font-semibold">{title}</Heading>

    <p className="mb-4 leading-loose text-gray-400">{description}</p>

    <div className="flex flex-col gap-4">{children}</div>
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
