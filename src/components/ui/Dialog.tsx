import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { tv } from "tailwind-variants";

import { theme } from "~/config";

import type { ReactNode, PropsWithChildren, ComponentProps } from "react";

import { IconButton } from "./Button";

import { createComponent } from ".";

export interface IDialogProps extends PropsWithChildren {
  title?: string | ReactNode;
  isOpen?: boolean;
  size?: "sm" | "md";
  onOpenChange?: ComponentProps<typeof RadixDialog.Root>["onOpenChange"];
}

const Content = createComponent(
  RadixDialog.Content,
  tv({
    base: "z-20 fixed bottom-0 rounded-t-2xl bg-white dark:bg-gray-900 dark:text-white px-7 py-6 w-full sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
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

export const Dialog = ({
  title = 0,
  size = undefined,
  isOpen = false,
  children,
  onOpenChange = undefined,
}: IDialogProps): JSX.Element => (
  <RadixDialog.Root open={isOpen} onOpenChange={onOpenChange}>
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed left-0 top-0 z-10 h-full w-full bg-black/70" />

      {/* Because of Portal we need to set the theme here */}
      <div className={theme.colorMode}>
        <Content size={size}>
          <RadixDialog.Title className="mb-6 text-2xl font-bold">{title}</RadixDialog.Title>

          {children}

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
