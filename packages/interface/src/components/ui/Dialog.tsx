import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import { tv } from "tailwind-variants";

import type { ReactNode, PropsWithChildren, ComponentProps } from "react";

import { IconButton, Button } from "./Button";
import { Spinner } from "./Spinner";

import { createComponent } from ".";

const Content = createComponent(
  RadixDialog.Content,
  tv({
    base: "z-20 fixed bottom-0 rounded-md p-12 flex flex-col justify-center gap-4 items-center text-center w-full font-sans sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 dark:bg-lightBlack bg-white",
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

interface IDialogProps {
  title: ReactNode;
  description: ReactNode;
  size: "sm" | "md";
  isOpen: boolean;
  isLoading?: boolean;
  button?: "primary" | "secondary";
  buttonName?: string;
  buttonAction?: () => void;
  onOpenChange: ComponentProps<typeof RadixDialog.Root>["onOpenChange"];
}

export const Dialog = ({
  title,
  description,
  size,
  isOpen,
  isLoading = false,
  button = undefined,
  buttonName = undefined,
  buttonAction = undefined,
  children = undefined,
  onOpenChange,
}: PropsWithChildren<IDialogProps>): JSX.Element => {
  const { theme } = useTheme();

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed left-0 top-0 z-10 h-full w-full bg-black/70" />

        {/* Because of Portal we need to set the theme here */}
        <div className={theme}>
          <Content size={size}>
            <RadixDialog.Title className="text-2xl font-bold uppercase dark:text-white">{title}</RadixDialog.Title>

            <RadixDialog.Description className="text-gray-400">{description}</RadixDialog.Description>

            {children}

            {isLoading && <Spinner className="h-6 w-6 py-4" />}

            {!isLoading && button && buttonName && buttonAction && (
              <Button size="auto" variant={button} onClick={buttonAction}>
                {buttonName}
              </Button>
            )}

            {onOpenChange ? (
              <RadixDialog.Close asChild>
                <IconButton className="absolute right-4 top-4" icon={X} variant="ghost" />
              </RadixDialog.Close>
            ) : null}
          </Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
