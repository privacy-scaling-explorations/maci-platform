import { ReactNode } from "react";

const MarkdownParagraph = ({ children }: { children: ReactNode }): JSX.Element => (
  <span className="font-sans text-lg font-normal leading-[27px] text-gray-400">{children}</span>
);

export const markdownComponents = {
  p: MarkdownParagraph,
};
