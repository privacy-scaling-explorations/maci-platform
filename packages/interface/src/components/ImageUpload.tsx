/* eslint-disable react/require-default-props */

import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { ImageIcon } from "lucide-react";
import { type ComponentProps, forwardRef, useRef, useCallback, ChangeEvent, ForwardedRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { IconButton } from "~/components/ui/Button";

export interface IImageUploadProps extends ComponentProps<"img"> {
  defaultValue?: string;
  name?: string;
  maxSize?: number;
}

export const ImageUpload = forwardRef(
  (
    {
      defaultValue = "none",
      name = "",
      maxSize = 1024 * 1024, // 1 MB
      className,
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
            className={clsx("relative cursor-pointer overflow-hidden", className)}
            role="button"
            tabIndex={0}
            onClick={onClickContainer}
            onKeyDown={onKeyDownContainer}
          >
            <IconButton
              className="absolute bottom-1 right-1"
              icon={ImageIcon}
              tabIndex={-1}
              onClick={onClickIconButton}
            />

            <div
              className={clsx("h-full rounded-xl bg-gray-200 bg-cover bg-center bg-no-repeat")}
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
