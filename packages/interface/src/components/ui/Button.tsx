import { LucideIcon } from "lucide-react";
import { type ComponentPropsWithRef, createElement, forwardRef, ReactNode } from "react";
import { tv } from "tailwind-variants";

import { createComponent } from ".";

const button = tv({
  base: "font-sans inline-flex items-center justify-center font-semibold uppercase rounded-lg text-center transition-colors duration-150 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  variants: {
    variant: {
      primary: "bg-black text-white hover:bg-blue-950 dark:bg-white dark:text-black dark:hover:bg-blue-100",
      inverted:
        "text-black border border-black hover:text-blue-500 hover:border-blue-500 dark:border-white dark:text-white",
      tertiary: "bg-blue-50 text-blue-500 border border-blue-500 hover:bg-blue-100",
      secondary: "bg-blue-500 text-white hover:bg-blue-600",
      ghost: "hover:bg-gray-100 dark:invert",
      outline: "border border-gray-200 hover:border-gray-300 dark:text-white dark:border-white",
      disabled: "border border-gray-200 bg-gray-50 text-gray-200 cursor-not-allowed",
      none: "",
    },
    size: {
      xs: "px-2 text-xs rounded-md",
      md: "py-2 px-5 text-base leading-6 rounded-[6px] !normal-case",
      sm: "px-3 py-2 h-8 text-xs rounded-md",
      default: "px-4 py-2 h-10 w-full",
      auto: "px-4 py-2 h-10 w-auto",
      icon: "h-12 w-12",
    },
    disabled: {
      true: "text-gray-400 pointer-events-none pointer-default opacity-50 border-none",
    },
  },
  defaultVariants: {
    variant: "none",
    size: "default",
  },
});

export const Button = createComponent("button", button);

export interface IIconButtonProps extends Omit<ComponentPropsWithRef<typeof Button>, "size"> {
  icon?: LucideIcon | null;
  size?: string;
  children?: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IIconButtonProps>(
  ({ children = null, icon = null, size = "", ...props }, ref) => (
    <Button ref={ref} {...props} size={children ? size : "icon"}>
      {icon &&
        createElement(icon, {
          className: `w-4 h-4 ${children ? "mr-2" : ""}`,
        })}

      {children}
    </Button>
  ),
);

IconButton.displayName = "IconButton";
