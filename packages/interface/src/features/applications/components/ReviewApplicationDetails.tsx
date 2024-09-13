import clsx from "clsx";
import { useMemo, type ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import { Heading } from "~/components/ui/Heading";

import type { Application } from "../types";

interface IValueFieldProps {
  title: string;
  body?: ReactNode;
  required?: boolean;
}

const ValueField = ({ title, body = undefined, required = false }: IValueFieldProps): JSX.Element => {
  const emptyPlaceholder = "(empty)";

  return (
    <div className="flex flex-col gap-2 text-sm">
      <b className={clsx(required && "after:text-blue-400 after:content-['*']")}>{title}</b>

      <div className="text-light flex flex-wrap gap-2 text-gray-400">
        {body === undefined && emptyPlaceholder}

        {Array.isArray(body) && body.length === 0 && emptyPlaceholder}

        {typeof body === "string" && body.length === 0 && emptyPlaceholder}

        {((typeof body === "string" && body.length > 0) || typeof body !== "string") && body}
      </div>
    </div>
  );
};

export const ReviewApplicationDetails = (): JSX.Element => {
  const form = useFormContext<Application>();

  const application = useMemo(() => form.getValues(), [form]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Heading className="mb-1 font-sans text-xl font-semibold">Review & Submit</Heading>

        <p className="leading-loose text-gray-400">Please review and submit your meme.</p>
      </div>

      <div className="flex flex-col gap-6 dark:text-white">
        <b className="text-lg">Meme</b>

        <ValueField required body={application.name} title="Name" />

        <div className="flex gap-6">
          <div>
            <p>Image</p>

            <div
              className="h-48 w-48 bg-gray-200 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url("${application.profileImageUrl}")`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
