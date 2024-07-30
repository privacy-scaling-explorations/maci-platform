import { type LucideIcon } from "lucide-react";
import { type ComponentProps, createElement } from "react";
import { tv } from "tailwind-variants";

import { createComponent } from ".";

const alert = tv({
  base: "rounded-xl p-4",
  variants: {
    variant: {
      warning: "bg-red-200 text-red-800",
      info: "bg-gray-100 text-gray-900",
      success: "bg-green-200 text-green-800",
    },
  },
});

export const AlertComponent = createComponent("div", alert);

export interface IAlertProps extends ComponentProps<typeof AlertComponent> {
  icon?: LucideIcon;
}

export const Alert = ({ icon = undefined, title, children, ...props }: IAlertProps): JSX.Element => (
  <AlertComponent {...props}>
    <div className="flex items-center gap-2">
      {icon ? createElement(icon, { className: "w-4 h-4" }) : null}

      <div className="mb-2 text-lg font-semibold">{title}</div>
    </div>

    {children}
  </AlertComponent>
);
