import clsx from "clsx";
import { RiErrorWarningLine } from "react-icons/ri";
import { tv } from "tailwind-variants";

import { createComponent } from ".";

const notice = tv({
  base: "w-full flex items-start text-sm gap-1 text-base",
  variants: {
    variant: {
      default: "text-blue-400 justify-center",
      block: "text-blue-700 bg-blue-400 border border-blue-700 rounded-lg p-4",
      note: "text-blue-400 justify-left",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const NoticeContainer = createComponent("div", notice);

interface INoticeProps {
  content: string;
  variant?: string;
  italic?: boolean;
  title?: string;
}

export const Notice = ({
  content,
  variant = undefined,
  italic = false,
  title = undefined,
}: INoticeProps): JSX.Element => (
  <NoticeContainer variant={variant}>
    <span className="pt-1">
      <RiErrorWarningLine />
    </span>

    <div>
      <b>{title ?? null}</b>

      <p className={clsx("text-sm", italic ? "italic" : "")}>{content}</p>
    </div>
  </NoticeContainer>
);
