import * as RadixDialog from "@radix-ui/react-dialog";
import type { ReactNode, PropsWithChildren, ComponentProps } from "react";
import { tv } from "tailwind-variants";
import { X } from "lucide-react";
import clsx from "clsx";

import { IconButton } from "./Button";
import { createComponent } from ".";
import { theme } from "~/config";
import { Spinner } from "./Spinner";

export const Dialog = ({
  title,
  description,
  size,
  isOpen,
  isLoading,
  button,
  buttonName,
  buttonAction,
  children,
  onOpenChange,
}: {
  title?: string | ReactNode;
  description?: string | ReactNode;
  size?: "sm" | "md";
  isOpen?: boolean;
  isLoading?: boolean;
  button?: "primary" | "secondary";
  buttonName?: string;
  buttonAction?: () => void;
  onOpenChange?: ComponentProps<typeof RadixDialog.Root>["onOpenChange"];
} & PropsWithChildren) => {
  return (
    <RadixDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed left-0 top-0 z-10 h-full w-full bg-black/70" />
        {/* Because of Portal we need to set the theme here */}
        <div className={theme.colorMode}>
          <Content size={size}>
            <RadixDialog.Title className="mb-6 text-2xl font-bold uppercase">
              {title}
            </RadixDialog.Title>
            <RadixDialog.Description className="text-gray-400">
              {description}
            </RadixDialog.Description>
            {children}
            {isLoading && <Spinner className="h-6 w-6 py-4" />}
            {!isLoading && button && buttonName && buttonAction && (
              <button
                className={clsx(
                  "mt-6 rounded-md border-none px-4 py-2 uppercase text-white",
                  button === "primary" ? "bg-blue-500" : "bg-blue-50",
                )}
                onClick={buttonAction}
              >
                {buttonName}
              </button>
            )}
            {onOpenChange ? (
              <RadixDialog.Close asChild>
                <IconButton
                  icon={X}
                  variant="ghost"
                  className="absolute right-4 top-4"
                ></IconButton>
              </RadixDialog.Close>
            ) : null}
          </Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
const Content = createComponent(
  RadixDialog.Content,
  tv({
    base: "z-20 fixed bottom-0 rounded-md bg-white p-12 flex flex-col justify-center items-center text-center w-full font-sans sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
    variants: {
      size: {
        sm: "sm:w-[456px] md:w-[456px]",
        md: "sm:w-[456px] md:w-[800px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }),
);
