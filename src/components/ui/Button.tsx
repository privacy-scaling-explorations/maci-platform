import { LucideIcon } from "lucide-react";
import { type ComponentPropsWithRef, createElement, forwardRef, ReactNode } from "react";
import { tv } from "tailwind-variants";

import { createComponent } from ".";

const button = tv({
  base: "inline-flex items-center justify-center font-semibold text-center transition-colors rounded-full duration-150 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:ring-offset-gray-800",
  variants: {
    variant: {
      primary:
        "bg-[#222133] hover:bg-[#b6cdec] dark:bg-[#222133] dark:hover:bg-[#b6cdec] dark:text-[#b6cdec] dark:hover:text-[#222133] dark:hover:border-[#222133] dark:hover:border-2 dark:disabled:bg-gray-500",
      ghost:
        "hover:bg-[#b6cdec] dark:hover:[#b6cdec] hover:text-[#222133] dark:hover:text[#222133] hover:border[#222133] dark:hover:border[#222133]",
      default: "bg-gray-100 dark:bg-gray-900 hover:bg-[#b6cdec] dark:hover:[#b6cdec]",
      inverted: "bg-white text-black hover:bg-white/90",
      link: "bg-none hover:underline",
      outline: "border-2 hover:bg-white/5",
    },
    size: {
      sm: "px-3 py-2 h-10 min-w-[40px]",
      default: "px-4 py-2 h-12",
      icon: "h-12 w-12",
    },
    disabled: {
      true: "text-gray-400 pointer-events-none pointer-default opacity-50 border-none",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export const Button = createComponent("button", button);

export interface IIconButtonProps extends ComponentPropsWithRef<typeof Button> {
  icon: LucideIcon;
  size: string;
  children: ReactNode;
}

export const IconButton = forwardRef(
  ({ children, icon, size, ...props }: IIconButtonProps, ref): JSX.Element => (
    <Button ref={ref} {...props} size={(children as ReactNode | undefined) ? size : "icon"}>
      {(icon as IIconButtonProps["icon"] | undefined)
        ? createElement(icon, {
            className: `w-4 h-4 ${children ? "mr-2" : ""}`,
          })
        : null}

      {children}
    </Button>
  ),
);

IconButton.displayName = "IconButton";
