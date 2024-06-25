import { RiErrorWarningLine } from "react-icons/ri";
import { tv } from "tailwind-variants";
import clsx from "clsx";

import { createComponent } from ".";

const notification = tv({
  base: "w-full flex items-start text-sm justify-center gap-1 text-base",
  variants: {
    variant: {
      default: "text-blue-400",
      block: "text-blue-700 bg-blue-400 border border-blue-700 rounded-lg p-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const NotificationContainer = createComponent("div", notification);

interface NotificationProps {
  content: string;
  variant?: string;
  italic?: boolean;
  title?: string;
}

export const Notification = ({
  content,
  variant,
  italic,
  title,
}: NotificationProps) => {
  return (
    <NotificationContainer variant={variant}>
      <span className="pt-1">
        <RiErrorWarningLine />
      </span>
      <div>
        <b>{title ?? null}</b>
        <p className={clsx("text-sm", italic ? "italic" : "")}>{content}</p>
      </div>
    </NotificationContainer>
  );
};
