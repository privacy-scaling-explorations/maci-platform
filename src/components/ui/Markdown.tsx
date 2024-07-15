import clsx from "clsx";
import { type ComponentProps } from "react";
import ReactMarkdown from "react-markdown";

export interface IMarkdownProps extends ComponentProps<typeof ReactMarkdown> {
  isLoading?: boolean;
}

export const Markdown = ({ isLoading = false, ...props }: IMarkdownProps): JSX.Element => (
  <div
    className={clsx("prose prose-xl max-w-none", {
      "h-96 animate-pulse rounded-xl bg-gray-100": isLoading,
    })}
  >
    <ReactMarkdown {...props} />
  </div>
);
