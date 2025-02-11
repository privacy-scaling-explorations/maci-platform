import { type PropsWithChildren } from "react";

import { cn } from "~/utils/classNames";

type IAppContainerProps = PropsWithChildren<{ as?: React.ElementType; className?: string }>;

export const AppContainer = ({
  children = null,
  as: Component = "div",
  className = "",
  ...props
}: IAppContainerProps): JSX.Element => (
  <Component className={cn("mx-auto flex w-full max-w-screen-2xl md:px-[30px]", className)} {...props}>
    {children}
  </Component>
);
