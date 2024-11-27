/* eslint-disable react/require-default-props */

import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { ImageIcon } from "lucide-react";
import { type ComponentProps, forwardRef, useRef, useCallback, ChangeEvent } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { IconButton } from "~/components/ui/Button";

export interface IImageUploadProps extends ComponentProps<"img"> {
  name?: string;
  maxSize?: number;
}

export const ImageUpload = forwardRef(
  (
    {
      name = "",
      maxSize = 1024 * 1024, // 1 MB
      className,
    }: IImageUploadProps,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _,
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
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
          <div className={clsx("relative cursor-pointer overflow-hidden", className)} onClick={onClickContainer}>
            <IconButton className="absolute bottom-1 right-1" icon={ImageIcon} onClick={onClickIconButton} />

            <div
              className={clsx("h-full rounded-xl bg-gray-200 bg-cover bg-center bg-no-repeat")}
              style={{
                backgroundImage: select.data ? `url("${value}")` : "none",
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
