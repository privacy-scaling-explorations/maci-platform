import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import { ImageIcon } from "lucide-react";
import { type ComponentProps, useRef, useCallback } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";

import { IconButton } from "~/components/ui/Button";

export interface IImageUploadProps extends ComponentProps<"img"> {
  name?: string;
  maxSize?: number;
}

export const ImageUpload = ({
  name = "",
  maxSize = 1024 * 1024, // 1 MB
  className,
}: IImageUploadProps): JSX.Element => {
  const ref = useRef<HTMLInputElement>(null);
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

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, ...field } }) => (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div
          className={clsx("relative cursor-pointer overflow-hidden", className)}
          onClick={() => ref.current?.click()}
        >
          <IconButton className="absolute bottom-1 right-1" icon={ImageIcon} onClick={onClickIconButton} />

          <div
            className={clsx("h-full rounded-xl bg-gray-200 bg-cover bg-center bg-no-repeat")}
            style={{
              backgroundImage: `url("${select.data ?? value}")`,
            }}
          />

          <input
            {...field}
            ref={ref}
            accept="image/png, image/jpeg"
            className="hidden"
            type="file"
            // value={value?.[name]}
            onChange={(event) => {
              const [file] = event.target.files ?? [];
              if (file) {
                select.mutate(file, {
                  onSuccess: (objectUrl) => {
                    onChange(objectUrl);
                  },
                });
              }
            }}
          />
        </div>
      )}
      rules={{ required: "Recipe picture is required" }}
    />
  );
};
