/* eslint-disable react/require-default-props */

import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { type ComponentProps, forwardRef, useRef, useCallback, ChangeEvent, ForwardedRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { cn } from "~/utils/classNames";

export interface IImageUploadProps extends ComponentProps<"img"> {
  defaultValue?: string;
  name?: string;
  maxSize?: number;
  rounded?: boolean;
}

export const ImageUpload = forwardRef(
  (
    {
      defaultValue = "none",
      name = "",
      maxSize = 1024 * 1024, // 1 MB
      className,
      rounded = false,
    }: IImageUploadProps,
    ref: ForwardedRef<HTMLInputElement>,
  ): JSX.Element => {
    const internalRef = useRef<HTMLInputElement>(null);
    const { control } = useFormContext();

    const select = useMutation({
      mutationFn: async (file: File) => {
        if (file.size >= maxSize) {
          toast.error("Image too large", {
            description: `The image to selected is: ${(file.size / 1024).toFixed(2)} / ${(maxSize / 1024).toFixed(2)} kb`,
          });
          throw new Error("IMAGE_TOO_LARGE");
        }

        return Promise.resolve(URL.createObjectURL(file));
      },
    });

    const onClickIconButton = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
    }, []);

    const onClickContainer = useCallback(() => {
      internalRef.current?.click();
    }, [internalRef]);

    const onKeyDownContainer = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          onClickContainer();
        }
      },
      [onClickContainer],
    );

    const onChangeInputImage = useCallback(
      (event: ChangeEvent<HTMLInputElement>, onChange: (event: string) => void) => {
        const [file] = event.target.files ?? [];
        if (file) {
          select.mutate(file, {
            onSuccess: (objectUrl) => {
              onChange(objectUrl);
            },
          });
        }
      },
      [select],
    );

    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, ...field } }) => (
          <div
            ref={ref}
            className={cn("relative cursor-pointer overflow-hidden", className)}
            role="button"
            tabIndex={0}
            onClick={onClickContainer}
            onKeyDown={onKeyDownContainer}
          >
            <button
              aria-label="Cover image"
              className={cn(
                "absolute flex h-8 w-8 items-center justify-center rounded-full bg-gray-200",
                rounded ? "inset-0 m-auto" : "bottom-2 right-2",
              )}
              tabIndex={-1}
              type="button"
              onClick={onClickIconButton}
            >
              <Image alt="upload-image" height="24" src="/image-cover.svg" width="24" />
            </button>

            <div
              className={cn(
                "h-full bg-gray-50 bg-cover bg-center bg-no-repeat duration-200 hover:bg-gray-100",
                rounded ? "rounded-full" : "rounded-xl",
              )}
              style={{
                backgroundImage: select.data ? `url("${value}")` : `url(${defaultValue})`,
              }}
            />

            <input
              {...field}
              ref={internalRef}
              accept="image/png, image/jpeg"
              className="hidden"
              type="file"
              onChange={(event) => {
                onChangeInputImage(event, onChange);
              }}
            />
          </div>
        )}
        rules={{ required: "Recipe picture is required" }}
      />
    );
  },
);

ImageUpload.displayName = "ImageUpload";
