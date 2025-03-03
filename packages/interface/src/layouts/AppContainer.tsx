import { type PropsWithChildren } from "react";

import { cn } from "~/utils/classNames";

type IAppContainerProps = PropsWithChildren<{ as?: React.ElementType; className?: string; fullWidth?: boolean }>;

export const AppContainer = ({
  children = null,
  as: Component = "div",
  className = "",
  fullWidth = false,
  ...props
}: IAppContainerProps): JSX.Element => (
  <Component
    className={cn("mx-auto flex w-full px-2", className, {
      "max-w-screen-2xl": !fullWidth,
      "max-w-full": fullWidth,
    })}
    {...props}
  >
    {children}
  </Component>
);
