import { FaCheckCircle } from "react-icons/fa";

import type { ReactNode } from "react";

interface ICheckItemProps {
  text: string;
  value: ReactNode;
}

export const CheckItem = ({ text, value }: ICheckItemProps): JSX.Element => (
  <div className="flex w-full items-center gap-2 border-b border-gray-200 py-4 font-light dark:text-white">
    <FaCheckCircle />

    <p>{text}</p>

    <div className="font-extrabold">{value}</div>
  </div>
);
