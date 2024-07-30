import { forwardRef } from "react";
import { tv } from "tailwind-variants";

import type { ComponentPropsWithRef, ReactNode, ElementType, ForwardRefExoticComponent, RefAttributes } from "react";

export type PolymorphicRef<C extends ElementType> = React.ComponentPropsWithRef<C>["ref"];

export type ComponentProps<C extends ElementType> = {
  as?: C;
  children?: ReactNode;
} & ComponentPropsWithRef<C>;

export function createComponent<T extends ElementType, V>(
  tag: T,
  variant: V,
): ForwardRefExoticComponent<Omit<ComponentProps<ElementType>, "ref"> & RefAttributes<unknown>> {
  const ComponentElement = forwardRef(
    <C extends ElementType>(
      { as: Component = tag, className, ...rest }: ComponentPropsWithRef<C>,
      ref?: PolymorphicRef<C>,
    ) => (
      <Component
        ref={ref}
        className={(variant as ReturnType<typeof tv>)({ class: className as string | undefined, ...rest })}
        {...rest}
      />
    ),
  );

  ComponentElement.displayName = tag.toString();

  return ComponentElement;
}
