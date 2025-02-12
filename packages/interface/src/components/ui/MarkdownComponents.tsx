import { ReactNode } from "react";
import { Components } from "react-markdown";

const MarkdownParagraph = ({ children }: { children: ReactNode }): JSX.Element => (
  <span className="font-sans text-lg font-normal leading-[27px] text-gray-400">{children}</span>
);

export const markdownComponents = {
  p: MarkdownParagraph,
} as Components;
